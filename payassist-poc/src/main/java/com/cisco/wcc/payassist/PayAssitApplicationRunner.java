package com.cisco.wcc.payassist;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import com.cisco.wcc.payassist.aws.ses.SesApiService;
import com.cisco.wcc.payassist.aws.smtp.SmtpApiService;
import com.cisco.wcc.payassist.aws.sns.SnsApiService;
import com.cisco.wcc.payassist.braintree.service.BraintreeGatewayService;

@Component
public class PayAssitApplicationRunner implements ApplicationRunner {

	private static final Logger logger = LoggerFactory.getLogger(PayAssitApplicationRunner.class);
			
	@Autowired
	private BraintreeGatewayService braintreeGatewayService;
	
	@Autowired
	private SesApiService sesApiService;
	
	@Autowired
	private SnsApiService snsApiService;
	
	@Autowired
	private SmtpApiService smtpApiService;
	
	@Override
	public void run(ApplicationArguments args) throws Exception {

		logger.info("Running ccai-pay application...");
		
		/*
		BigDecimal balance = BigDecimal.valueOf(50.50);
		System.out.println("Current Balance: " + balance);
		BigDecimal exist = BigDecimal.valueOf(20.20);
		BigDecimal update = BigDecimal.valueOf(30.30);
		balance = balance.add(update.subtract(exist));
		System.out.println("New Balance: " + balance);	
		exist = BigDecimal.valueOf(30.30);
		update = BigDecimal.valueOf(10.10);
		balance = balance.add(update.subtract(exist));
		System.out.println("Latest Balance: " + balance);
		*/
		//braintreeGatewayService.makeTransaction();
		
		//sesApiService.send("songuyen@gmail.com", "This is a test email message from payment service");
		//snsApiService.send("+14084313395", "This is a test sms message from payment service");
		//smtpApiService.send("songuyen@gmail.com", "This is a test email message from payment service");
		/*
		CardPaymentRequest r = new CardPaymentRequest();
		r.setAccountId(1000000001L);
		r.setCardNumber("4111111111111111");
		r.setExpirationDate("10/2022");
		r.setCvvCode("123");
		r.setPostalCode("95111");
		r.setAmount(new BigDecimal("80.50"));
		braintreeGatewayService.makeCreditCardTransaction(r);
		*/
	}

}
