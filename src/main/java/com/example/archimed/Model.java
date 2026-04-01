package com.example.archimed;

import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Data
@Component
public class Model {
    // Поля со значениями по умолчанию из класса констант
    private float gravity = 0.0f;
    private float powerArchimed = 0.0f;
    private float powerStocks = 0.0f;
    private float ballDensity = Constants.DEFAULT_BALL_DENSITY;
    private float radius = Constants.DEFAULT_RADIUS;
    private float mass = Constants.DEFAULT_MASS;
    private float liquidDensity = Constants.DEFAULT_LIQUID_DENSITY;
    private float volume = Constants.DEFAULT_VOLUME;
    private float viscosity = Constants.DEFAULT_VISCOSITY;

    // Конструктор по умолчанию
    public Model() {
        log.info("Создана новая модель с параметрами по умолчанию");
    }

    // Конструктор со всеми параметрами
//    public Model(float gravity, float powerArchimed, float powerStocks,
//                 float ballDensity, float radius, float mass,
//                 float liquidDensity, float volume, float viscosity) {
//        this.gravity = gravity;
//        this.powerArchimed = powerArchimed;
//        this.powerStocks = powerStocks;
//        this.ballDensity = ballDensity;
//        this.radius = radius;
//        this.mass = mass;
//        this.liquidDensity = liquidDensity;
//        this.volume = volume;
//        this.viscosity = viscosity;
//        log.info("Создана новая модель с пользовательскими параметрами");
//    }
//
//    // Конструктор для обратной совместимости
//    public Model(float gravity, float powerArchimed, float powerStocks,
//                 float ballDensity, float radius, float mass,
//                 float liquidDensity, float volume) {
//        this(gravity, powerArchimed, powerStocks, ballDensity, radius, mass,
//                liquidDensity, volume, Constants.DEFAULT_VISCOSITY);
//    }

    // Методы для вычислений
    public void calculateGravity() {
        if (ballDensity <= 0 || radius <= 0) {
            log.warn("Некорректные параметры для расчета силы тяжести");
            this.gravity = 0;
            return;
        }

        // F = ρ * (4/3) * π * r³ * g
        this.gravity = this.ballDensity * (4.0f / 3.0f) * Constants.PI *
                (this.radius * this.radius * this.radius) * Constants.G;
        log.debug("Рассчитана сила тяжести: {} {}", this.gravity, Constants.UNIT_FORCE);
    }

    public void calculatePowerArchimed() {
        if (liquidDensity <= 0 || volume <= 0) {
            log.warn("Некорректные параметры для расчета силы Архимеда");
            this.powerArchimed = 0;
            return;
        }

        // F = ρ_ж * V * g
        this.powerArchimed = this.liquidDensity * this.volume * Constants.G;
        log.debug("Рассчитана сила Архимеда: {} {}", this.powerArchimed, Constants.UNIT_FORCE);
    }

    public void calculatePowerStocks() {
        if (viscosity <= 0 || radius <= 0) {
            log.warn("Некорректные параметры для расчета силы Стокса");
            this.powerStocks = 0;
            return;
        }

        // F = 6π * η * r * v
        this.powerStocks = 6.0f * Constants.PI * this.viscosity *
                this.radius * Constants.DEFAULT_VELOCITY;
        log.debug("Рассчитана сила Стокса: {} {}", this.powerStocks, Constants.UNIT_FORCE);
    }

    // Метод для выполнения всех расчетов
    public void calculateAll() {
        log.info("Выполнение всех расчетов модели");
        calculateGravity();
        calculatePowerArchimed();
        calculatePowerStocks();
    }

    // Метод для сброса к значениям по умолчанию
    public void resetToDefaults() {
        this.gravity = 0.0f;
        this.powerArchimed = 0.0f;
        this.powerStocks = 0.0f;
        this.ballDensity = Constants.DEFAULT_BALL_DENSITY;
        this.radius = Constants.DEFAULT_RADIUS;
        this.mass = Constants.DEFAULT_MASS;
        this.liquidDensity = Constants.DEFAULT_LIQUID_DENSITY;
        this.volume = Constants.DEFAULT_VOLUME;
        this.viscosity = Constants.DEFAULT_VISCOSITY;
        log.info("Модель сброшена к значениям по умолчанию");
    }

    // Геттеры и сеттеры автоматически создаются Lombok @Data
    // Но мы можем добавить свои, если нужно

    public float getGravityInKilonewtons() {
        return gravity;
    }

    public float getPowerArchimedInKilonewtons() {
        return powerArchimed;
    }

    public float getPowerStocksInKilonewtons() {
        return powerStocks;
    }

    @Override
    public String toString() {
        return String.format("Model{ballDensity=%.2f %s, radius=%.3f %s, viscosity=%.4f %s, " +
                        "gravity=%.2f %s, archimed=%.2f %s, stocks=%.4f %s}",
                ballDensity, Constants.UNIT_DENSITY,
                radius, Constants.UNIT_RADIUS,
                viscosity, Constants.UNIT_VISCOSITY,
                gravity, Constants.UNIT_FORCE,
                powerArchimed, Constants.UNIT_FORCE,
                powerStocks, Constants.UNIT_FORCE);
    }
}