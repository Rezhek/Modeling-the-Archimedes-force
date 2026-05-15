package com.example.physic.modules.lab;

public class Result {
    private final double finalVolume;
    private final double finalPressure;

    public Result(double finalVolume, double finalPressure) {
        this.finalVolume = finalVolume;
        this.finalPressure = finalPressure;
    }

    public double getFinalVolume() {
        return finalVolume;
    }

    public double getFinalPressure() {
        return finalPressure;
    }
}
