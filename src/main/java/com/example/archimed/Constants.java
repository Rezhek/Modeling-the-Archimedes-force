package com.example.archimed;

public final class Constants {
     public Constants() {
        // Приватный конструктор, чтобы запретить создание экземпляров
    }

    // Физические константы
    public static final float G = 9.81f;                    // Ускорение свободного падения (м/с²)
    public static final float PI = 3.14159265359f;          // Число Пи (более точное значение)
    public static final float DEFAULT_VELOCITY = 3.0f;      // Скорость по умолчанию (м/с)

    // Значения по умолчанию для модели
    public static final float DEFAULT_BALL_DENSITY = 1000.0f;    // Плотность шара по умолчанию (кг/м³)
    public static final float DEFAULT_LIQUID_DENSITY = 1000.0f;  // Плотность жидкости по умолчанию (кг/м³)
    public static final float DEFAULT_RADIUS = 0.1f;             // Радиус по умолчанию (м)
    public static final float DEFAULT_MASS = 1.0f;               // Масса по умолчанию (кг)
    public static final float DEFAULT_VOLUME = 0.00418879f;      // Объем по умолчанию (м³)
    public static final float DEFAULT_VISCOSITY = 0.001f;        // Вязкость по умолчанию (Па·с)

    // Единицы измерения
    public static final String UNIT_DENSITY = "кг/м³";
    public static final String UNIT_RADIUS = "м";
    public static final String UNIT_MASS = "кг";
    public static final String UNIT_VOLUME = "м³";
    public static final String UNIT_VISCOSITY = "Па·с";
    public static final String UNIT_FORCE = "Н";
    public static final String UNIT_VELOCITY = "м/с";
}