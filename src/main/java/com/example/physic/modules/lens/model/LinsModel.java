package com.example.physic.modules.lens.model;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import lombok.Data;

import static java.lang.Math.abs;

@Slf4j
@Component
@Data
public class LinsModel {

    public float Focus;            // Фокусное расстояние линзы
    public float ObjectDistance;   // Расстояние от предмета до линзы
    public float ImageDistance;    // Расстояние от линзы до изображения
    public float ObjectHeight;     // Высота предмета
    public float ImageHeight;      // Высота изображения
    public float IncreaseLens;     // Увеличение линзы
    public boolean IsValid;        // Изображение существует либо нет
    public String ImageType;       // Хранение типа изображения предмета
    public String LensType = "converging"; // Тип линзы (converging - собирающая, diverging - рассеивающая)

    // Начало функций проверки
    public void isValidEnter() {
        if ("diverging".equals(LensType)) {
            IsValid = Focus > 0 && ObjectDistance > 0;
        } else {
            IsValid = Focus > 0 && ObjectDistance > 0 && Focus != ObjectDistance;
        }
    }

    public void checkImageType() {
        if (IsValid) {
            if ("diverging".equals(LensType)) {
                ImageType = "Мнимое, прямое, уменьшенное";
            } else {
                if (ImageDistance > 0) {
                    ImageType = "Действительное, перевёрнутое, ";
                } else {
                    ImageType = "Мнимое, прямое, ";
                }

                if (IncreaseLens < 1) {
                    ImageType += "уменьшенное";
                } else if (IncreaseLens > 1) {
                    ImageType += "увеличенное";
                } else {
                    ImageType += "в натуральную величину";
                }
            }
        } else {
            if ("converging".equals(LensType) && ObjectDistance == Focus) {
                ImageType = "Изображение в бесконечности";
            } else {
                ImageType = "Нет изображения (ошибка ввода)";
            }
        }
    }

    public void calculateImageDistance() {
        float f_calc = "diverging".equals(LensType) ? -this.Focus : this.Focus;
        this.ImageDistance = (this.ObjectDistance * f_calc) / (this.ObjectDistance - f_calc);
    }

    public void calculateImageHeight() {
        this.ImageHeight = abs(this.ImageDistance / this.ObjectDistance) * this.ObjectHeight;
    }

    public void calculateIncrease() {
        this.IncreaseLens = abs(this.ImageDistance / this.ObjectDistance);
    }
}
