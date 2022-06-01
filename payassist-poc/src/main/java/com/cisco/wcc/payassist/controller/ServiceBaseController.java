package com.cisco.wcc.payassist.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class ServiceBaseController {

	@RequestMapping(path="/")
	public String baseIndex() {
		return "index";
	}

	@RequestMapping(path="/braintree")
	public String braintreeIndex(@RequestParam(value="acct") String accountId, Model model) {
		model.addAttribute("acct", accountId);
		return "braintree/index";
	}
	
	@RequestMapping(path="/account")
	public String accountIndex() {
		return "account/index";
	}
	
}
