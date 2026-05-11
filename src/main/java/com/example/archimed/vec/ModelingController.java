package com.example.archimed.vec;

import com.example.archimed.Constants;
import com.example.archimed.ErrorRate;
import com.example.archimed.Model;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ModelingController {

    private final Model model;
    private final ErrorRate errorRate;

    // ========== Вспомогательный метод для добавления констант в модель ==========
    private void addConstantAttributes(org.springframework.ui.Model uiModel) {
        uiModel.addAttribute("g", Constants.G);
        uiModel.addAttribute("pi", Constants.PI);
        uiModel.addAttribute("velocity", Constants.DEFAULT_VELOCITY);
        uiModel.addAttribute("defaultBallDensity", Constants.DEFAULT_BALL_DENSITY);
        uiModel.addAttribute("defaultLiquidDensity", Constants.DEFAULT_LIQUID_DENSITY);
        uiModel.addAttribute("defaultRadius", Constants.DEFAULT_RADIUS);
        uiModel.addAttribute("defaultMass", Constants.DEFAULT_MASS);
        uiModel.addAttribute("defaultVolume", Constants.DEFAULT_VOLUME);
        uiModel.addAttribute("defaultViscosity", Constants.DEFAULT_VISCOSITY);
        uiModel.addAttribute("unitForce", Constants.UNIT_FORCE);
        uiModel.addAttribute("unitVelocity", Constants.UNIT_VELOCITY);
    }

    // ========== Главная страница ==========
    @GetMapping("/")
    public String showPage(org.springframework.ui.Model uiModel) {
        log.info("Открыта главная страница");

        // Начальные расчёты
        float volume = (4.0f / 3.0f) * Constants.PI * (float) Math.pow(model.getRadius(), 3);
        model.setVolume(volume);
        model.setMass(model.getBallDensity() * volume);
        model.calculateGravity();
        model.calculatePowerArchimed();
        model.calculatePowerStocks();

        // Передача атрибутов
        addConstantAttributes(uiModel);
        uiModel.addAttribute("model", model);

        return "index";
    }

    // ========== Обработка формы расчёта ==========
    @PostMapping("/")
    public String calculate(
            @RequestParam("ballDensity") float ballDensity,
            @RequestParam("radius") float radius,
            @RequestParam("liquidDensity") float liquidDensity,
            @RequestParam("viscosity") float viscosity,
            org.springframework.ui.Model uiModel) {

        log.info("Выполняется расчет: ballDensity={}, radius={}, liquidDensity={}, viscosity={}",
                ballDensity, radius, liquidDensity, viscosity);

        model.setBallDensity(ballDensity);
        model.setRadius(radius);
        model.setLiquidDensity(liquidDensity);
        model.setViscosity(viscosity);

        float volume = (4.0f / 3.0f) * Constants.PI * (float) Math.pow(radius, 3);
        model.setVolume(volume);
        model.setMass(ballDensity * volume);

        model.calculateGravity();
        model.calculatePowerArchimed();
        model.calculatePowerStocks();

        addConstantAttributes(uiModel);
        uiModel.addAttribute("model", model);

        return "index";
    }

    // ========== Эндпоинты для работы с погрешностями ==========

    @PostMapping("/measure")
    @ResponseBody
    public Double measure(@RequestParam String forceType) {
        double trueValue = switch (forceType.toLowerCase()) {
            case "gravity" -> model.getGravity();
            case "archimed" -> model.getPowerArchimed();
            case "stocks" -> model.getPowerStocks();
            default -> throw new IllegalArgumentException("Неизвестный тип силы: " + forceType);
        };

        double measured = errorRate.applyNoise(trueValue);
        errorRate.addMeasurement(measured);
        log.info("Измерено {}: истинное={}, измеренное={}", forceType, trueValue, measured);
        return measured;
    }

    @GetMapping("/error")
    @ResponseBody
    public Double getError() {
        return errorRate.calculateAbsoluteError();
    }

    @PostMapping("/error/reset")
    @ResponseBody
    public String resetError() {
        errorRate.resetMeasurements();
        return "Измерения сброшены";
    }

    @PostMapping("/error/toggle")
    @ResponseBody
    public Boolean toggleNoise(@RequestParam boolean active) {
        errorRate.setActive(active);
        return errorRate.isActive();
    }
}