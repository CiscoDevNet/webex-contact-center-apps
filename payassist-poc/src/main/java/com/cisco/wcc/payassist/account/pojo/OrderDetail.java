package com.cisco.wcc.payassist.account.pojo;

import java.math.BigDecimal;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;

@Entity
@SequenceGenerator(name="ordersequence", sequenceName="ORD_SEQ", initialValue=2000000001, allocationSize=1)
public class OrderDetail {

	@Id
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="ordersequence")
	private Long id;
	
	private Long accountId;
	
	private String orderDate;
	
	private BigDecimal orderAmount;
	
	private OrderStatus orderStatus;
	
	private String paidDate;
	
	private String transactionId;
	
	private String error;
	
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getAccountId() {
		return accountId;
	}

	public void setAccountId(Long accountId) {
		this.accountId = accountId;
	}

	public String getOrderDate() {
		return orderDate;
	}

	public void setOrderDate(String orderDate) {
		this.orderDate = orderDate;
	}

	public BigDecimal getOrderAmount() {
		return orderAmount;
	}

	public void setOrderAmount(BigDecimal orderAmount) {
		//this.orderAmount.setScale(2, RoundingMode.CEILING);
		this.orderAmount = orderAmount;
		System.out.println("ORDER AMOUNT: " + this.orderAmount);
	}

	public OrderStatus getOrderStatus() {
		return orderStatus;
	}

	public void setOrderStatus(OrderStatus orderStatus) {
		this.orderStatus = orderStatus;
	}

	public String getPaidDate() {
		return paidDate;
	}

	public void setPaidDate(String paidDate) {
		this.paidDate = paidDate;
	}

	public String getTransactionId() {
		return transactionId;
	}

	public void setTransactionId(String transactionId) {
		this.transactionId = transactionId;
	}

	public String getError() {
		return error;
	}

	public void setError(String error) {
		this.error = error;
	}
}
