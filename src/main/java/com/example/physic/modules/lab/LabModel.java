package com.example.physic.modules.lab;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Setter
@Getter
public class LabModel {
    public double Temperature;
    public double Mass;
    public double MolarMass;
    public boolean IsValid;
    public String ProcessInfo;
    public double PostVolume;
    public double PostPressure;
    public double Volume;
    public double Pressure;
    private double pressureError;

    public void isValidEnter() {
        IsValid = Volume > 0 && MolarMass > 0 && Mass >= 0 && Temperature > 0 && PostVolume > 0;
    }

    public void checkProcessStatus() {
        if (IsValid) {
            ProcessInfo = "Изотермический процесс стабилен (T = const)";
        } else {
            ProcessInfo = "Ошибка: Некорректные параметры системы";
        }
    }

    public void setGasType(String gasName) {
        switch (gasName) {
            case "Кислород" -> this.MolarMass = 0.032;
            case "Азот" -> this.MolarMass = 0.028;
            case "Воздух" -> this.MolarMass = 0.029;
            case "Гелий" -> this.MolarMass = 0.004;
            case "Другой газ" -> this.MolarMass = 1;
        }
    }

    public void updateGasData(String gasName) {
        if (gasName != null && !gasName.isEmpty() && !gasName.equals("Другой газ")) {
            setGasType(gasName);
        }
    }
    public boolean isCustomMolarMass() {
        return MolarMass != 0.029 && MolarMass != 0.032 && MolarMass != 0.028 && MolarMass != 0.004;
    }
    public void calculatedPressure() {
        double MolarGasConstant = Constants.MOLAR_GAS_CONSTANT;
        if (IsValid && this.Volume > 0) {
            this.Pressure = (this.Mass * MolarGasConstant * this.Temperature) / (this.MolarMass * this.Volume);
            this.Pressure = Math.round(this.Pressure * 100.0) / 100.0;
        }
    }

    public void calculatedPostPressure() {
        double MolarGasConstant = Constants.MOLAR_GAS_CONSTANT;
        if (IsValid && this.PostVolume > 0) {
            this.PostPressure = (this.Mass * MolarGasConstant * this.Temperature) / (this.MolarMass * this.PostVolume);
            this.PostPressure = Math.round(this.PostPressure * 100.0) / 100.0;
        }
    }

    private Errors errors = new Errors();
    private List<Result> history = new ArrayList<>();

    public boolean isSameExperiment(double newMass, double newMolarMass, double newTemp) {
        return Double.compare(this.Mass, newMass) == 0 &&
                Double.compare(this.MolarMass, newMolarMass) == 0 &&
                Double.compare(this.Temperature, newTemp) == 0;
    }
    public void addToHistory(double v, double p) {
        Result res = new Result(v, p);
        this.history.add(res);
        if (this.errors != null) {
            this.errors.addToHistory(v, p);
        }
    }
    public void clearHistory() {
        this.history.clear();
        this.errors.clearHistory();
    }
    public double calculatePressureError() {
        return this.errors.calculatePressureError(
                this.Mass,
                this.Temperature,
                this.PostVolume,
                this.PostPressure,
                this.errors.getFinalVolumeError()
        );
    }
}
