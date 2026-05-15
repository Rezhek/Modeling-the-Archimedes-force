package com.example.physic.modules.snellius.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Data
@NoArgsConstructor
@Component
@Slf4j
public class ErrorRate {
    private Double n1;
    private Double n2;
    private Double alpha;
    private Double beta;

    private Double deltaN1 = 0.01;
    private Double deltaN2 = 0.01;
    private Double deltaAlpha = 0.5;

    private Double absoluteError;
    private Double relativeError;

    public void calculateError() {
        if (n1 == null || n2 == null || alpha == null || beta == null) {
            log.warn("Cannot calculate error: some parameters are null");
            return;
        }

        double alphaRad = Math.toRadians(alpha);
        double betaRad = Math.toRadians(beta);

        double term1 = Math.pow((Math.sin(alphaRad) / Math.sin(betaRad)) * deltaN1, 2);
        double term2 = Math.pow((n1 * Math.cos(alphaRad) / Math.sin(betaRad)) * Math.toRadians(deltaAlpha), 2);
        double term3 = Math.pow((n1 * Math.sin(alphaRad) * Math.cos(betaRad) / Math.pow(Math.sin(betaRad), 2)) * Math.toRadians(0.5), 2);

        absoluteError = Math.sqrt(term1 + term2 + term3);
        relativeError = (absoluteError / n2) * 100;

        log.info("Error calculated: absolute={}, relative={}%", absoluteError, relativeError);
    }
}
