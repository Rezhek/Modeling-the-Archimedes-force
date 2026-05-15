package com.example.physic.web.ui;

import com.example.physic.modules.snellius.model.SnelliusModel;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping("/snellius")
public class SnelliusController {

    @GetMapping
    public ModelAndView snelliusPage() {
        ModelAndView mav = new ModelAndView("snellius");
        mav.addObject("n1", 1.0);
        mav.addObject("n2", 1.5);
        return mav;
    }
}
