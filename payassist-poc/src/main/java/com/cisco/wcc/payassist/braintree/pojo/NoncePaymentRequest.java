package com.cisco.wcc.payassist.braintree.pojo;

public class NoncePaymentRequest extends PaymentRequest {

	private String methodNonce;

	public String getMethodNonce() {
		return methodNonce;
	}

	public void setMethodNonce(String methodNonce) {
		this.methodNonce = methodNonce;
	}
}
