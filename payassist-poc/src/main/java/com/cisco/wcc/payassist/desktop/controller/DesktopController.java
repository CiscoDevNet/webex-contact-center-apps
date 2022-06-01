package com.cisco.wcc.payassist.desktop.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.cisco.wcc.payassist.account.AccountService;
import com.cisco.wcc.payassist.account.pojo.AccountDetail;
import com.cisco.wcc.payassist.account.pojo.OrderDetail;

@RestController
@CrossOrigin
@RequestMapping(path="/desktop")
public class DesktopController {

	private static final Logger logger = LoggerFactory.getLogger(DesktopController.class);
	
	@Autowired
	private AccountService accountService;
	
	@RequestMapping(path="/account", method=RequestMethod.POST, consumes="application/json", produces="application/json")
	public ResponseEntity<AccountDetail> saveAccount(@RequestBody AccountDetail account) {
		logger.info("Save account for " + account.getFirstName());
		return new ResponseEntity<AccountDetail>(accountService.saveAccount(account), HttpStatus.OK);		
	}
	
	@RequestMapping(path="/account/async", method=RequestMethod.POST, consumes="application/json", produces="application/json")
	public ResponseEntity<String> saveAccountAsync(@RequestBody AccountDetail account) {
		logger.info("Save account async for " + account.getPhoneNumber());
		accountService.saveAccountAsync(account);
		return new ResponseEntity<String>("OK", HttpStatus.OK);		
	}
	
	@RequestMapping(path="/account/id/{id}", method=RequestMethod.GET, produces="application/json")
	public ResponseEntity<AccountDetail> getAccountById(@PathVariable Long id) {
		logger.info("Get account by id " + id);		
		return new ResponseEntity<AccountDetail>(accountService.getAccount(id), HttpStatus.OK);		
	}
	
	@RequestMapping(path="/account/async/id/{id}", method=RequestMethod.GET, produces="application/json")
	public ResponseEntity<String> getAccountByIdAsync(@PathVariable Long id) {
		logger.info("Get account async for " + id);
		accountService.getAccountAsync(id);
		return new ResponseEntity<String>("OK", HttpStatus.OK);		
	}
	
	@RequestMapping(path="/account/ani/{ani}", method=RequestMethod.GET, produces="application/json")
	public ResponseEntity<AccountDetail> getAccountByPhone(@PathVariable String ani) {
		logger.info("Get account for " + ani);		
		return new ResponseEntity<AccountDetail>(accountService.getOrCreateAccountByPhone(ani), HttpStatus.OK);		
	}
	
	@RequestMapping(path="/account/async/ani/{ani}", method=RequestMethod.GET, produces="application/json")
	public ResponseEntity<String> getAccountByPhoneAsync(@PathVariable String ani) {
		logger.info("Get account async for " + ani);		
		accountService.getOrCreateAccountByPhoneAsync(ani);		
		return new ResponseEntity<String>("OK", HttpStatus.OK);		
	}
	
	@RequestMapping(path="/order/ani/{ani}", method=RequestMethod.POST, consumes="application/json", produces="application/json")
	public ResponseEntity<OrderDetail> createOrder(@PathVariable String ani) {
		logger.info("Create order for " + ani);
		return new ResponseEntity<OrderDetail>(accountService.createOrder(ani), HttpStatus.OK);		
	}
	
	@RequestMapping(path="/order/async/ani/{ani}", method=RequestMethod.POST, consumes="application/json", produces="application/json")
	public ResponseEntity<String> createOrderAsync(@PathVariable String ani) {
		logger.info("Create order async for " + ani);
		accountService.createOrderAsync(ani);
		return new ResponseEntity<String>("OK", HttpStatus.OK);		
	}
	
	@RequestMapping(path="/order", method=RequestMethod.POST, consumes="application/json", produces="application/json")
	public ResponseEntity<OrderDetail> saveOrder(@RequestBody OrderDetail order) {
		logger.info("Save order " + order.getAccountId());
		return new ResponseEntity<OrderDetail>(accountService.saveOrder(order), HttpStatus.OK);		
	}
	
	@RequestMapping(path="/order/async", method=RequestMethod.POST, consumes="application/json", produces="application/json")
	public ResponseEntity<String> saveOrderAsync(@RequestBody OrderDetail order) {
		logger.info("Save order async for " + order.getAccountId());
		accountService.saveOrderAsync(order);
		return new ResponseEntity<String>("OK", HttpStatus.OK);		
	}
	
	@RequestMapping(path="/order/ani/{ani}", method=RequestMethod.GET, produces="application/json")
	public ResponseEntity<List<OrderDetail>> getOrdersByPhone(@PathVariable String ani) {
		logger.info("Get order for " + ani);		
		return new ResponseEntity<List<OrderDetail>>(accountService.getOrdersByPhone(ani), HttpStatus.OK);		
	}
	
	@RequestMapping(path="/order/async/ani/{ani}", method=RequestMethod.GET, produces="application/json")
	public ResponseEntity<String> getOrdersByPhoneAsync(@PathVariable String ani) {
		logger.info("Get order async for " + ani);		
		accountService.getOrdersByPhoneAsync(ani);		
		return new ResponseEntity<String>("OK", HttpStatus.OK);		
	}
	
}
