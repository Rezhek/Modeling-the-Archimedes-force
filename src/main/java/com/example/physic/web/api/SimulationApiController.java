package com.example.physic.web.api;

import com.example.physic.modules.snellius.model.SnelliusModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/snellius")
public class SimulationApiController {

    @GetMapping("/calculate")
    public SnelliusModel calculate(@RequestParam Double angle,
                                   @RequestParam Double n1,
                                   @RequestParam Double n2) {
        SnelliusModel model = new SnelliusModel();
        model.setAlpha(angle);
        model.setN1(n1);
        model.setN2(n2);
        model.calculateBeta();
        return model; 
    }
}
