package com.example.archimed;

import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@Getter
@Setter
public class ErrorRate {

    private boolean active = false;
    private List<Double> measurements = new ArrayList<>();
    private double confidenceLevel = 0.95;
    private double studentCoefficient = 2.0;
    private double systematicError = 0.5;

    private final Random random = new Random();

    /**
     * Применяет шум к истинному значению.
     */
    public double applyNoise(double trueValue) {
        if (!active || trueValue < 0) return trueValue;

        double randomComponent = -1.0 + (2.0 * random.nextDouble());
        double measuredValue = trueValue + systematicError + randomComponent;
        return Math.round(measuredValue * 100.0) / 100.0;
    }

    /**
     * Добавляет измерение в накопленный список.
     */
    public void addMeasurement(double measurement) {
        measurements.add(measurement);
    }

    /**
     * Рассчитывает полную абсолютную погрешность.
     */
    public double calculateAbsoluteError() {
        if (measurements.isEmpty()) return systematicError;

        double sum = 0;
        for (double m : measurements) sum += m;
        double average = sum / measurements.size();

        double varianceSum = 0;
        for (double m : measurements) {
            varianceSum += Math.pow(m - average, 2);
        }

        int n = measurements.size();
        double standardDeviation = Math.sqrt(varianceSum / Math.max(1, n - 1));
        double standardError = standardDeviation / Math.sqrt(n);
        double statisticalError = studentCoefficient * standardError;

        double totalError = Math.sqrt(Math.pow(systematicError, 2) + Math.pow(statisticalError, 2));
        return Math.round(totalError * 100.0) / 100.0;
    }

    /**
     * Очищает накопленные измерения.
     */
    public void resetMeasurements() {
        measurements.clear();
    }
}