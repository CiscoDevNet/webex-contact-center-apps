package com.cisco.wcc.payassist.account.pojo;

import java.util.HashMap;
import java.util.Map;

public enum OrderStatus {

	Created("Created"),
	
	Processed("Processed"),
	
	Shipped("Shipped"),
	
	Completed("Completed");
	
	OrderStatus(String orderStatus) {
		this.orderStatus = orderStatus;
	}
	
	private String orderStatus;
	
	public String getValue() {
		return this.orderStatus;
	}
	
	private static final Map<String, OrderStatus> lookup = new HashMap<>();
	
	static {
		for(OrderStatus c : OrderStatus.values()) {
			lookup.put(c.getValue(), c);
		}
	}
	
	public static OrderStatus get(String value) {
		return lookup.get(value);
	}
	
	@Override
	public String toString() {
		return this.getValue();
	}


	private OrderStatus name;
	
	public OrderStatus getName() {
		return name;
	}

	public void setName(OrderStatus name) {
		this.name = name;
	}
}
