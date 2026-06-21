#include <algorithm>
#include <array>
#include <cctype>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <limits>
#include <map>
#include <numeric>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

struct Point2D {
    double x = 0.0;
    double y = 0.0;
};

struct LineCandidate {
    double position = 0.0;
    double angleDegrees = 0.0;
    double score = 0.0;
    Point2D p0;
    Point2D p1;
};

struct CorrelationConfig {
    int blurKernelSize = 3;
    double gradientDepth = 3.0;

    std::array<double, 2> topBand = {0.08, 0.42};
    std::array<double, 2> bottomBand = {0.45, 0.82};
    std::array<double, 2> leftBand = {0.05, 0.28};
    std::array<double, 2> rightBand = {0.72, 0.95};

    double sideAngleRangeDegrees = 6.0;
    double angleStepDegrees = 0.5;
    double positionStepPixels = 1.0;
    int samplesPerLine = 256;
    int lineHalfWidthPixels = 1;

    bool useFirstCriticalPeak = true;
    double peakProminenceRatio = 0.25;
    int peakSmoothKernelSize = 5;
};

struct CorrelationResult {
    std::array<Point2D, 4> corners;  // top-left, top-right, bottom-right, bottom-left
    int left = 0;
    int top = 0;
    int right = 0;
    int bottom = 0;
    double totalScore = 0.0;

    LineCandidate leftSide;
    LineCandidate rightSide;
    LineCandidate topSide;
    LineCandidate bottomSide;
};

CorrelationResult detectArtworkBoxCrossCorrelation(
    const std::vector<std::uint8_t>& gray,
    int width,
    int height,
    const CorrelationConfig& config = CorrelationConfig()) {

    if (width <= 2 || height <= 2) {
        throw std::invalid_argument("Image dimensions must be larger than 2x2.");
    }
    if (gray.size() != static_cast<std::size_t>(width * height)) {
        throw std::invalid_argument("gray.size() must equal width * height.");
    }
    if (config.samplesPerLine <= 1) {
        throw std::invalid_argument("samplesPerLine must be greater than 1.");
    }
    if (config.positionStepPixels <= 0.0 || config.angleStepDegrees <= 0.0) {
        throw std::invalid_argument("Step sizes must be positive.");
    }

    const auto index = [width](int x, int y) {
        return static_cast<std::size_t>(y * width + x);
    };

    const auto clampInt = [](int value, int lo, int hi) {
        return std::max(lo, std::min(value, hi));
    };

    const auto clampDouble = [](double value, double lo, double hi) {
        return std::max(lo, std::min(value, hi));
    };

    std::vector<double> image(gray.size());
    for (std::size_t i = 0; i < gray.size(); ++i) {
        image[i] = static_cast<double>(gray[i]) / 255.0;
    }

    const auto blur3x3Binomial = [&](const std::vector<double>& src) {
        std::vector<double> dst(src.size(), 0.0);
        const int kernel[3][3] = {
            {1, 2, 1},
            {2, 4, 2},
            {1, 2, 1},
        };

        for (int y = 0; y < height; ++y) {
            for (int x = 0; x < width; ++x) {
                double sum = 0.0;
                for (int ky = -1; ky <= 1; ++ky) {
                    for (int kx = -1; kx <= 1; ++kx) {
                        const int xx = clampInt(x + kx, 0, width - 1);
                        const int yy = clampInt(y + ky, 0, height - 1);
                        sum += kernel[ky + 1][kx + 1] * src[index(xx, yy)];
                    }
                }
                dst[index(x, y)] = sum / 16.0;
            }
        }
        return dst;
    };

    if (config.blurKernelSize > 1) {
        image = blur3x3Binomial(image);
    }

    std::vector<double> gx(image.size(), 0.0);
    std::vector<double> gy(image.size(), 0.0);
    std::vector<double> verticalEnergy(image.size(), 0.0);
    std::vector<double> horizontalEnergy(image.size(), 0.0);

    const int sobelX[3][3] = {
        {-1, 0, 1},
        {-2, 0, 2},
        {-1, 0, 1},
    };
    const int sobelY[3][3] = {
        {-1, -2, -1},
        {0, 0, 0},
        {1, 2, 1},
    };

    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            double sx = 0.0;
            double sy = 0.0;
            for (int ky = -1; ky <= 1; ++ky) {
                for (int kx = -1; kx <= 1; ++kx) {
                    const int xx = clampInt(x + kx, 0, width - 1);
                    const int yy = clampInt(y + ky, 0, height - 1);
                    const double value = image[index(xx, yy)];
                    sx += sobelX[ky + 1][kx + 1] * value;
                    sy += sobelY[ky + 1][kx + 1] * value;
                }
            }

            gx[index(x, y)] = sx * config.gradientDepth;
            gy[index(x, y)] = sy * config.gradientDepth;
            verticalEnergy[index(x, y)] = std::abs(gx[index(x, y)]);
            horizontalEnergy[index(x, y)] = std::abs(gy[index(x, y)]);
        }
    }

    const auto percentile = [](std::vector<double> values, double p) {
        if (values.empty()) {
            return 0.0;
        }
        p = std::max(0.0, std::min(100.0, p));
        const std::size_t k = static_cast<std::size_t>(
            std::round((p / 100.0) * static_cast<double>(values.size() - 1)));
        std::nth_element(values.begin(), values.begin() + static_cast<std::ptrdiff_t>(k), values.end());
        return values[k];
    };

    const double verticalThreshold = percentile(verticalEnergy, 75.0);
    const double horizontalThreshold = percentile(horizontalEnergy, 75.0);
    for (double& value : verticalEnergy) {
        if (value < verticalThreshold) {
            value = 0.0;
        }
    }
    for (double& value : horizontalEnergy) {
        if (value < horizontalThreshold) {
            value = 0.0;
        }
    }

    const auto bilinearSample = [&](const std::vector<double>& img, double x, double y) {
        x = clampDouble(x, 0.0, static_cast<double>(width - 1));
        y = clampDouble(y, 0.0, static_cast<double>(height - 1));

        const int x0 = static_cast<int>(std::floor(x));
        const int y0 = static_cast<int>(std::floor(y));
        const int x1 = clampInt(x0 + 1, 0, width - 1);
        const int y1 = clampInt(y0 + 1, 0, height - 1);
        const double tx = x - static_cast<double>(x0);
        const double ty = y - static_cast<double>(y0);

        const double v00 = img[index(x0, y0)];
        const double v10 = img[index(x1, y0)];
        const double v01 = img[index(x0, y1)];
        const double v11 = img[index(x1, y1)];
        const double top = v00 * (1.0 - tx) + v10 * tx;
        const double bottom = v01 * (1.0 - tx) + v11 * tx;
        return top * (1.0 - ty) + bottom * ty;
    };

    const auto sampleMeanAlongLine = [&](const std::vector<double>& img, Point2D p0, Point2D p1) {
        const double dx = p1.x - p0.x;
        const double dy = p1.y - p0.y;
        const double length = std::sqrt(dx * dx + dy * dy) + 1e-12;
        const double nx = -dy / length;
        const double ny = dx / length;

        double sum = 0.0;
        int count = 0;
        for (int offset = -config.lineHalfWidthPixels; offset <= config.lineHalfWidthPixels; ++offset) {
            for (int i = 0; i < config.samplesPerLine; ++i) {
                const double t = static_cast<double>(i) / static_cast<double>(config.samplesPerLine - 1);
                const double x = p0.x + t * dx + static_cast<double>(offset) * nx;
                const double y = p0.y + t * dy + static_cast<double>(offset) * ny;
                sum += bilinearSample(img, x, y);
                ++count;
            }
        }
        return sum / static_cast<double>(std::max(count, 1));
    };

    const auto verticalLineFromCenterAngle = [height](double xCenter, double angleDegrees) {
        constexpr double pi = 3.141592653589793238462643383279502884;
        const double radians = angleDegrees * pi / 180.0;
        const double dxPerDy = std::tan(radians);
        const double y0 = 0.0;
        const double y1 = static_cast<double>(height - 1);
        const double yc = 0.5 * static_cast<double>(height - 1);
        return std::array<Point2D, 2>{
            Point2D{xCenter + (y0 - yc) * dxPerDy, y0},
            Point2D{xCenter + (y1 - yc) * dxPerDy, y1},
        };
    };

    const auto horizontalLineFromCenterAngle = [width](double yCenter, double angleDegrees) {
        constexpr double pi = 3.141592653589793238462643383279502884;
        const double radians = angleDegrees * pi / 180.0;
        const double dyPerDx = std::tan(radians);
        const double x0 = 0.0;
        const double x1 = static_cast<double>(width - 1);
        const double xc = 0.5 * static_cast<double>(width - 1);
        return std::array<Point2D, 2>{
            Point2D{x0, yCenter + (x0 - xc) * dyPerDx},
            Point2D{x1, yCenter + (x1 - xc) * dyPerDx},
        };
    };

    const auto searchVerticalSide = [&](int x0, int x1) {
        std::vector<LineCandidate> sweep;
        LineCandidate best;
        best.score = -std::numeric_limits<double>::infinity();

        for (double x = static_cast<double>(x0); x <= static_cast<double>(x1) + 1e-9; x += config.positionStepPixels) {
            for (double angle = -config.sideAngleRangeDegrees;
                 angle <= config.sideAngleRangeDegrees + 1e-9;
                 angle += config.angleStepDegrees) {

                const auto line = verticalLineFromCenterAngle(x, angle);
                const double score = sampleMeanAlongLine(verticalEnergy, line[0], line[1]);
                LineCandidate candidate{x, angle, score, line[0], line[1]};
                sweep.push_back(candidate);
                if (candidate.score > best.score) {
                    best = candidate;
                }
            }
        }
        return std::pair<LineCandidate, std::vector<LineCandidate>>{best, sweep};
    };

    const auto searchHorizontalSide = [&](int y0, int y1) {
        std::vector<LineCandidate> sweep;
        LineCandidate best;
        best.score = -std::numeric_limits<double>::infinity();

        for (double y = static_cast<double>(y0); y <= static_cast<double>(y1) + 1e-9; y += config.positionStepPixels) {
            for (double angle = -config.sideAngleRangeDegrees;
                 angle <= config.sideAngleRangeDegrees + 1e-9;
                 angle += config.angleStepDegrees) {

                const auto line = horizontalLineFromCenterAngle(y, angle);
                const double score = sampleMeanAlongLine(horizontalEnergy, line[0], line[1]);
                LineCandidate candidate{y, angle, score, line[0], line[1]};
                sweep.push_back(candidate);
                if (candidate.score > best.score) {
                    best = candidate;
                }
            }
        }
        return std::pair<LineCandidate, std::vector<LineCandidate>>{best, sweep};
    };

    const auto collapseSweepToProfile = [](const std::vector<LineCandidate>& sweep) {
        std::map<double, LineCandidate> bestByPosition;
        for (const LineCandidate& candidate : sweep) {
            auto it = bestByPosition.find(candidate.position);
            if (it == bestByPosition.end() || candidate.score > it->second.score) {
                bestByPosition[candidate.position] = candidate;
            }
        }

        std::vector<double> positions;
        std::vector<double> scores;
        std::vector<LineCandidate> records;
        positions.reserve(bestByPosition.size());
        scores.reserve(bestByPosition.size());
        records.reserve(bestByPosition.size());

        for (const auto& [position, candidate] : bestByPosition) {
            positions.push_back(position);
            scores.push_back(candidate.score);
            records.push_back(candidate);
        }
        return std::tuple<std::vector<double>, std::vector<double>, std::vector<LineCandidate>>{
            positions, scores, records};
    };

    const auto smooth1D = [](const std::vector<double>& values, int kernelSize) {
        kernelSize = std::max(3, kernelSize);
        if (kernelSize % 2 == 0) {
            ++kernelSize;
        }

        std::vector<double> smoothed(values.size(), 0.0);
        const int radius = kernelSize / 2;
        for (std::size_t i = 0; i < values.size(); ++i) {
            double sum = 0.0;
            int count = 0;
            for (int j = -radius; j <= radius; ++j) {
                const int idx = static_cast<int>(i) + j;
                if (idx >= 0 && idx < static_cast<int>(values.size())) {
                    sum += values[static_cast<std::size_t>(idx)];
                    ++count;
                }
            }
            smoothed[i] = sum / static_cast<double>(std::max(count, 1));
        }
        return smoothed;
    };

    const auto firstCriticalPeakIndex = [&](const std::vector<double>& positions,
                                            const std::vector<double>& scores,
                                            bool scanFromLow) {
        if (scores.size() < 3) {
            return static_cast<std::size_t>(
                std::distance(scores.begin(), std::max_element(scores.begin(), scores.end())));
        }

        const std::vector<double> smoothed = smooth1D(scores, config.peakSmoothKernelSize);
        const double globalMax = *std::max_element(smoothed.begin(), smoothed.end());
        const double minimumProminence = config.peakProminenceRatio * globalMax;

        std::vector<std::size_t> peaks;
        for (std::size_t i = 1; i + 1 < smoothed.size(); ++i) {
            const bool isLocalMaximum = smoothed[i] >= smoothed[i - 1] && smoothed[i] > smoothed[i + 1];
            if (!isLocalMaximum) {
                continue;
            }

            const double leftMin = *std::min_element(smoothed.begin(), smoothed.begin() + static_cast<std::ptrdiff_t>(i + 1));
            const double rightMin = *std::min_element(smoothed.begin() + static_cast<std::ptrdiff_t>(i), smoothed.end());
            const double prominence = smoothed[i] - std::max(leftMin, rightMin);
            if (prominence >= minimumProminence) {
                peaks.push_back(i);
            }
        }

        if (peaks.empty()) {
            return static_cast<std::size_t>(
                std::distance(smoothed.begin(), std::max_element(smoothed.begin(), smoothed.end())));
        }

        return *std::min_element(peaks.begin(), peaks.end(), [&](std::size_t a, std::size_t b) {
            return scanFromLow ? positions[a] < positions[b] : positions[a] > positions[b];
        });
    };

    const auto chooseSide = [&](const LineCandidate& globalBest,
                                const std::vector<LineCandidate>& sweep,
                                bool scanFromLow) {
        if (!config.useFirstCriticalPeak) {
            return globalBest;
        }

        const auto [positions, scores, records] = collapseSweepToProfile(sweep);
        const std::size_t selectedIndex = firstCriticalPeakIndex(positions, scores, scanFromLow);
        return records.at(selectedIndex);
    };

    const auto bandToPixelRange = [](int length, const std::array<double, 2>& band) {
        const int lo = static_cast<int>(std::round(static_cast<double>(length) * band[0]));
        const int hi = static_cast<int>(std::round(static_cast<double>(length) * band[1]));
        return std::array<int, 2>{lo, hi};
    };

    const auto leftRange = bandToPixelRange(width, config.leftBand);
    const auto rightRange = bandToPixelRange(width, config.rightBand);
    const auto topRange = bandToPixelRange(height, config.topBand);
    const auto bottomRange = bandToPixelRange(height, config.bottomBand);

    const auto [leftGlobalBest, leftSweep] = searchVerticalSide(leftRange[0], leftRange[1]);
    const auto [rightGlobalBest, rightSweep] = searchVerticalSide(rightRange[0], rightRange[1]);
    const auto [topGlobalBest, topSweep] = searchHorizontalSide(topRange[0], topRange[1]);
    const auto [bottomGlobalBest, bottomSweep] = searchHorizontalSide(bottomRange[0], bottomRange[1]);

    const LineCandidate leftBest = chooseSide(leftGlobalBest, leftSweep, true);
    const LineCandidate rightBest = chooseSide(rightGlobalBest, rightSweep, false);
    const LineCandidate topBest = chooseSide(topGlobalBest, topSweep, true);
    const LineCandidate bottomBest = chooseSide(bottomGlobalBest, bottomSweep, false);

    const auto lineABC = [](Point2D p0, Point2D p1) {
        const double a = p0.y - p1.y;
        const double b = p1.x - p0.x;
        const double c = p0.x * p1.y - p1.x * p0.y;
        return std::array<double, 3>{a, b, c};
    };

    const auto intersect = [](const std::array<double, 3>& l1, const std::array<double, 3>& l2) {
        const double a1 = l1[0];
        const double b1 = l1[1];
        const double c1 = l1[2];
        const double a2 = l2[0];
        const double b2 = l2[1];
        const double c2 = l2[2];
        const double d = a1 * b2 - a2 * b1;
        if (std::abs(d) < 1e-10) {
            throw std::runtime_error("Detected side lines are parallel; cannot compute corners.");
        }
        return Point2D{(b1 * c2 - b2 * c1) / d, (c1 * a2 - c2 * a1) / d};
    };

    const auto leftLine = lineABC(leftBest.p0, leftBest.p1);
    const auto rightLine = lineABC(rightBest.p0, rightBest.p1);
    const auto topLine = lineABC(topBest.p0, topBest.p1);
    const auto bottomLine = lineABC(bottomBest.p0, bottomBest.p1);

    CorrelationResult result;
    result.corners = {
        intersect(topLine, leftLine),
        intersect(topLine, rightLine),
        intersect(bottomLine, rightLine),
        intersect(bottomLine, leftLine),
    };

    const auto minMaxX = std::minmax_element(result.corners.begin(), result.corners.end(), [](Point2D a, Point2D b) {
        return a.x < b.x;
    });
    const auto minMaxY = std::minmax_element(result.corners.begin(), result.corners.end(), [](Point2D a, Point2D b) {
        return a.y < b.y;
    });

    result.left = static_cast<int>(std::round(minMaxX.first->x));
    result.right = static_cast<int>(std::round(minMaxX.second->x));
    result.top = static_cast<int>(std::round(minMaxY.first->y));
    result.bottom = static_cast<int>(std::round(minMaxY.second->y));
    result.leftSide = leftBest;
    result.rightSide = rightBest;
    result.topSide = topBest;
    result.bottomSide = bottomBest;
    result.totalScore = leftBest.score + rightBest.score + topBest.score + bottomBest.score;

    return result;
}

struct GrayImage {
    int width = 0;
    int height = 0;
    std::vector<std::uint8_t> pixels;
};

static std::string nextPgmToken(std::istream& input) {
    std::string token;
    char ch = '\0';

    while (input.get(ch)) {
        if (std::isspace(static_cast<unsigned char>(ch))) {
            continue;
        }
        if (ch == '#') {
            input.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            continue;
        }
        token.push_back(ch);
        break;
    }

    while (input.get(ch)) {
        if (std::isspace(static_cast<unsigned char>(ch))) {
            break;
        }
        token.push_back(ch);
    }

    if (token.empty()) {
        throw std::runtime_error("Unexpected end of PGM file.");
    }
    return token;
}

static GrayImage readPgm(const std::string& path) {
    std::ifstream input(path, std::ios::binary);
    if (!input) {
        throw std::runtime_error("Could not open input image: " + path);
    }

    const std::string magic = nextPgmToken(input);
    if (magic != "P2" && magic != "P5") {
        throw std::runtime_error("Only P2/P5 grayscale PGM files are supported.");
    }

    GrayImage image;
    image.width = std::stoi(nextPgmToken(input));
    image.height = std::stoi(nextPgmToken(input));
    const int maxValue = std::stoi(nextPgmToken(input));
    if (image.width <= 0 || image.height <= 0 || maxValue <= 0 || maxValue > 65535) {
        throw std::runtime_error("Invalid PGM header.");
    }

    image.pixels.resize(static_cast<std::size_t>(image.width * image.height));

    if (magic == "P5") {
        if (maxValue > 255) {
            for (std::uint8_t& pixel : image.pixels) {
                const int hi = input.get();
                const int lo = input.get();
                if (hi == EOF || lo == EOF) {
                    throw std::runtime_error("Unexpected end of PGM pixel data.");
                }
                const int value = (hi << 8) | lo;
                pixel = static_cast<std::uint8_t>(std::round(255.0 * value / maxValue));
            }
        } else {
            input.read(reinterpret_cast<char*>(image.pixels.data()), static_cast<std::streamsize>(image.pixels.size()));
            if (input.gcount() != static_cast<std::streamsize>(image.pixels.size())) {
                throw std::runtime_error("Unexpected end of PGM pixel data.");
            }
            if (maxValue != 255) {
                for (std::uint8_t& pixel : image.pixels) {
                    pixel = static_cast<std::uint8_t>(std::round(255.0 * pixel / maxValue));
                }
            }
        }
    } else {
        for (std::uint8_t& pixel : image.pixels) {
            const int value = std::stoi(nextPgmToken(input));
            pixel = static_cast<std::uint8_t>(std::round(255.0 * value / maxValue));
        }
    }

    return image;
}

static GrayImage makeSyntheticCard() {
    GrayImage image;
    image.width = 320;
    image.height = 448;
    image.pixels.assign(static_cast<std::size_t>(image.width * image.height), 235);

    const auto setRect = [&](int x0, int y0, int x1, int y1, std::uint8_t value) {
        x0 = std::max(0, x0);
        y0 = std::max(0, y0);
        x1 = std::min(image.width - 1, x1);
        y1 = std::min(image.height - 1, y1);
        for (int y = y0; y <= y1; ++y) {
            for (int x = x0; x <= x1; ++x) {
                image.pixels[static_cast<std::size_t>(y * image.width + x)] = value;
            }
        }
    };

    setRect(30, 25, 289, 422, 205);
    setRect(64, 90, 255, 340, 80);
    setRect(82, 122, 237, 306, 145);
    setRect(145, 90, 150, 340, 60);  // interior distractor edge
    setRect(64, 90, 255, 94, 45);
    setRect(64, 336, 255, 340, 45);
    setRect(64, 90, 68, 340, 45);
    setRect(251, 90, 255, 340, 45);

    return image;
}

static void printSide(const std::string& name, const LineCandidate& side) {
    std::cout << "  " << std::setw(6) << std::left << name
              << " position=" << std::setw(8) << std::right << std::fixed << std::setprecision(2) << side.position
              << " angle=" << std::setw(7) << side.angleDegrees
              << " score=" << std::setw(10) << std::setprecision(6) << side.score << '\n';
}

int main(int argc, char** argv) {
    try {
        GrayImage image;
        if (argc >= 2) {
            image = readPgm(argv[1]);
            std::cout << "Loaded " << argv[1] << " (" << image.width << "x" << image.height << ")\n";
        } else {
            image = makeSyntheticCard();
            std::cout << "No PGM provided; using built-in synthetic card ("
                      << image.width << "x" << image.height << ")\n";
        }

        CorrelationConfig config;
        const CorrelationResult result = detectArtworkBoxCrossCorrelation(
            image.pixels,
            image.width,
            image.height,
            config);

        std::cout << "\nDetected bounding box: "
                  << "left=" << result.left
                  << ", top=" << result.top
                  << ", right=" << result.right
                  << ", bottom=" << result.bottom << '\n';

        std::cout << "Corners (TL, TR, BR, BL):\n";
        for (const Point2D& point : result.corners) {
            std::cout << "  (" << std::fixed << std::setprecision(2)
                      << point.x << ", " << point.y << ")\n";
        }

        std::cout << "\nChosen side correlations:\n";
        printSide("left", result.leftSide);
        printSide("right", result.rightSide);
        printSide("top", result.topSide);
        printSide("bottom", result.bottomSide);
        std::cout << "  total score = " << std::fixed << std::setprecision(6)
                  << result.totalScore << '\n';

        return 0;
    } catch (const std::exception& ex) {
        std::cerr << "Error: " << ex.what() << '\n';
        return 1;
    }
}
