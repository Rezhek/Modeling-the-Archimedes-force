package com.example.physic.web.ui;

import com.example.physic.modules.lab.LabModel;
import com.example.physic.modules.lab.Errors;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/lab")
@SessionAttributes("gasModel")
public class LabController {

    @ModelAttribute("gasModel")
    public LabModel gasModel() {
        LabModel model = new LabModel();
        model.setTemperature(300.0);
        model.setMass(1.0);
        model.setMolarMass(1.0);
        model.setVolume(1.0);
        model.setPostVolume(1.0);
        return model;
    }

    @GetMapping
    public String index(@ModelAttribute("gasModel") LabModel gasModel) {
        return "lab";
    }

    @PostMapping("/calculate")
    public String calculate(
            @RequestParam(required = false) String gasName,
            @RequestParam double Mass,
            @RequestParam double MolarMass,
            @RequestParam double Temperature,
            @RequestParam double PostVolume,
            @RequestParam double Volume,
            @ModelAttribute("gasModel") LabModel gasModel,
            ModelMap modelMap) {

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
            double pError = gasModel.calculatePressureError();
            gasModel.setPressureError(pError);
            modelMap.addAttribute("pressureError", pError);
        }

        return "lab";
    }

    @PostMapping("/clear")
    public String clear(@ModelAttribute("gasModel") LabModel gasModel) {
        gasModel.clearHistory();
        return "redirect:/lab";
    }

    @PostMapping("/updateReliability")
    public String updateReliability(@RequestParam String reliability, @ModelAttribute("gasModel") LabModel gasModel, ModelMap modelMap) {
        if (gasModel != null) {
            gasModel.getErrors().setReliability(Errors.Reliability.valueOf(reliability));
            gasModel.getErrors().calculateError();
            double pError = gasModel.calculatePressureError();
            gasModel.setPressureError(pError);
            modelMap.addAttribute("pressureError", pError);
        }
        return "lab";
    }
}
