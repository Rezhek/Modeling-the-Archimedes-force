package com.example.physic.web.api;

import com.example.physic.modules.lab.LabModel;
import com.example.physic.modules.lab.Errors;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lab")
public class LabApiController {

    @GetMapping("/data")
    public LabModel getLabData(HttpSession session) {
        LabModel gasModel = (LabModel) session.getAttribute("gasModel");
        if (gasModel == null) {
            gasModel = new LabModel();
            gasModel.setTemperature(300.0);
            gasModel.setMass(1.0);
            gasModel.setMolarMass(1.0);
            gasModel.setVolume(1.0);
            gasModel.setPostVolume(1.0);
            session.setAttribute("gasModel", gasModel);
        }
        return gasModel;
    }

    @PostMapping("/calculate")
    public LabModel calculate(
            @RequestParam(required = false) String gasName,
            @RequestParam double Mass,
            @RequestParam double MolarMass,
            @RequestParam double Temperature,
            @RequestParam double PostVolume,
            @RequestParam double Volume,
            HttpSession session) {
        LabModel gasModel = (LabModel) session.getAttribute("gasModel");

        if (gasModel == null) {
            gasModel = new LabModel();
        }

        if (!gasModel.isSameExperiment(Mass, MolarMass, Temperature)) {
            gasModel.clearHistory();
        }

        gasModel.setMass(Mass);
        gasModel.setTemperature(Temperature);
        gasModel.setMolarMass(MolarMass);
        gasModel.setVolume(Volume);
        gasModel.setPostVolume(PostVolume);

        if (gasName != null && !gasName.isEmpty()) {
            gasModel.updateGasData(gasName);
        }

        gasModel.isValidEnter();
        if (gasModel.IsValid) {
            gasModel.calculatedPressure();
            gasModel.calculatedPostPressure();
            gasModel.checkProcessStatus();
            gasModel.addToHistory(gasModel.getPostVolume(), gasModel.getPostPressure());
            gasModel.getErrors().calculateError();
        }

        session.setAttribute("gasModel", gasModel);
        return gasModel;
    }
}
