package com.example.physic.modules.snellius.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Data
@NoArgsConstructor
@Component
@Slf4j
public class SnelliusModel {
    private Double n1 = 1.0; // Воздух
    private Double n2 = 1.5; // Стекло
    private Double alpha;    // Угол падения
    private Double beta;     // Угол преломления

    public void calculateBeta() {
        if (alpha == null) return;
        double alphaRad = Math.toRadians(alpha);
        double sinBeta = (n1 * Math.sin(alphaRad)) / n2;

        if (sinBeta > 1.0) {
            beta = null; // Полное внутреннее отражение
            log.info("Total internal reflection for alpha={}", alpha);
        } else {
            beta = Math.toDegrees(Math.asin(sinBeta));
            log.info("Calculated beta={} for alpha={}", beta, alpha);
        }
    }

    public Double calculateN2FromAngles(double a, double b) {
        double aRad = Math.toRadians(a);
        double bRad = Math.toRadians(b);
        if (Math.sin(bRad) == 0) return null;
        return n1 * Math.sin(aRad) / Math.sin(bRad);
    }
}
