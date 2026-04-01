package com.example.archimed;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ModelTest {
    Model model;

    @Test
    void getGravity() {
        model = new Model();
        model.setGravity(123);
        assertEquals(123, model.getGravity());
    }

    @Test
    void getPowerArchimed() {
        model = new Model();
        model.setPowerArchimed(123);
        assertEquals(123, model.getPowerArchimed());
    }

    @Test
    void getPowerStocks() {
        model = new Model();
        model.setPowerStocks(123);
        assertEquals(123, model.getPowerStocks());
    }
}