package com.example.archimed.vec;

import com.example.archimed.Model;
import com.example.archimed.Constants;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ModelingController {

    private  final Model model;  // Ваш класс Model

    @GetMapping("/")
    public String showPage(org.springframework.ui.Model uiModel) {  // Полное имя для Spring Model
        log.info("Открыта главная страница");

        // Вычисляем объем и массу для начального отображения
        float volume = (4.0f / 3.0f) * Constants.PI * (float) Math.pow(model.getRadius(), 3);
        model.setVolume(volume);
        model.setMass(model.getBallDensity() * volume);

        // Выполняем начальные расчеты
        model.calculateGravity();
        model.calculatePowerArchimed();
        model.calculatePowerStocks();

        // Добавляем модель в представление
        uiModel.addAttribute("model", model);
        uiModel.addAttribute("constants", new Constants());

        return "index";
    }

    @PostMapping("/")
    public String calculate(
            @RequestParam("ballDensity") float ballDensity,
            @RequestParam("radius") float radius,
            @RequestParam("liquidDensity") float liquidDensity,
            @RequestParam("viscosity") float viscosity,
            org.springframework.ui.Model uiModel) {  // Полное имя для Spring Model

        log.info("Выполняется расчет с параметрами:");
        log.info("Плотность шара: {} кг/м³", ballDensity);
        log.info("Радиус: {} м", radius);
        log.info("Плотность жидкости: {} кг/м³", liquidDensity);
        log.info("Вязкость: {} Па·с", viscosity);

        // Устанавливаем значения
        model.setBallDensity(ballDensity);
        model.setRadius(radius);
        model.setLiquidDensity(liquidDensity);
        model.setViscosity(viscosity);

        // Вычисляем объем шара: V = (4/3) * π * r³
        float volume = (4.0f / 3.0f) * Constants.PI * (float) Math.pow(radius, 3);
        model.setVolume(volume);

        // Вычисляем массу шара: m = ρ * V
        model.setMass(ballDensity * volume);

        // Выполняем расчеты сил
        model.calculateGravity();
        model.calculatePowerArchimed();
        model.calculatePowerStocks();

        // Добавляем модель в представление
        uiModel.addAttribute("model", model);
        uiModel.addAttribute("constants", new Constants());

        return "index";
    }
}