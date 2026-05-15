package com.example.physic.model;

import com.example.physic.snellius.model.SnelliusModel;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SnelliusModelTest {

    SnelliusModel snelliusModel = new SnelliusModel();

    @Test
    void calculateSnellius() {
         snelliusModel.setCoefficientOut(2.42);
         snelliusModel.setCoefficientIn(1.0);
         snelliusModel.setAngleIn(25.0);
         snelliusModel.calculateSnellius();

        assertEquals(snelliusModel.getAngleOut(), 10.06);

        snelliusModel.setCoefficientOut(2.42);
        snelliusModel.setCoefficientIn(1.0);
        snelliusModel.setAngleIn(65.0);
        snelliusModel.calculateSnellius();

        assertEquals(snelliusModel.getAngleOut(), 21.99);

        snelliusModel.setCoefficientOut(2.42);
        snelliusModel.setCoefficientIn(1.0);
        snelliusModel.setAngleIn(79.0);
        snelliusModel.calculateSnellius();

        assertEquals(snelliusModel.getAngleOut(), 23.93 );
    }

    @Test
    void getCoefficientIn() {
    }

    @Test
    void setAngleOut() {
    }
}