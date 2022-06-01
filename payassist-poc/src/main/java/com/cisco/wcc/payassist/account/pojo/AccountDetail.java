package com.cisco.wcc.payassist.account.pojo;

import java.math.BigDecimal;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;

@Entity
@SequenceGenerator(name="accountsequence", sequenceName="ACC_SEQ", initialValue=1000000001, allocationSize=1)
public class AccountDetail {

	@Id
	@GeneratedValue(strategy=GenerationType.AUTO, generator="accountsequence")
	private Long id;
	
	private String firstName;
	
	private String lastName;
	
	private String phoneNumber;
	
	private String emailAddress;
	
	private String streetAddress;
	
	private String city;
	
	private String state;
	
	private String zipCode;
	
	private BigDecimal currentBalance;
	
	private String createdDate;
	
	private Long currentOrderId;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}

	public String getEmailAddress() {
		return emailAddress;
	}

	public void setEmailAddress(String emailAddress) {
		this.emailAddress = emailAddress;
	}

	public String getStreetAddress() {
		return streetAddress;
	}

	public void setStreetAddress(String streetAddress) {
		this.streetAddress = streetAddress;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}

	public String getZipCode() {
		return zipCode;
	}

	public void setZipCode(String zipCode) {
		this.zipCode = zipCode;
	}

	public BigDecimal getCurrentBalance() {
		return currentBalance;
	}

	public void setCurrentBalance(BigDecimal currentBalance) {
		//this.currentBalance.setScale(2, RoundingMode.CEILING);
		this.currentBalance = currentBalance;
	}
		
	public void updateBalance(BigDecimal amount) {
		//this.currentBalance.setScale(2, RoundingMode.CEILING);
		this.currentBalance = this.currentBalance.add(amount);
	}

	public String getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(String createdDate) {
		this.createdDate = createdDate;
	}

	public Long getCurrentOrderId() {
		return currentOrderId;
	}

	public void setCurrentOrderId(Long currentOrderId) {
		this.currentOrderId = currentOrderId;
	}
	
}
