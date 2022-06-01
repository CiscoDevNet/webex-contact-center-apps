package com.cisco.wcc.payassist.account;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.cisco.wcc.payassist.account.pojo.AccountDetail;
import com.cisco.wcc.payassist.account.pojo.OrderDetail;
import com.cisco.wcc.payassist.account.pojo.OrderStatus;
import com.cisco.wcc.payassist.account.repo.AccountRepository;
import com.cisco.wcc.payassist.account.repo.OrderRepository;
import com.cisco.wcc.payassist.braintree.pojo.PaymentResponse;
import com.cisco.wcc.payassist.util.DateTimeUtils;

@Service
public class AccountService {

	private static final Logger logger = LoggerFactory.getLogger(AccountService.class);
	
	@Autowired
	private AccountRepository accountRepository;
	
	@Autowired 
	private OrderRepository orderRepository;

	@Autowired
	private SimpMessagingTemplate messagingTemplate;
	
	public AccountDetail getAccount(Long id) {
		logger.info("Get account " + id);
		
		if(id != null && id > 0) {
			Optional<AccountDetail> account = accountRepository.findById(id);
			
			if(account.isPresent()) {
				logger.info("Account found " + id);
				return account.get();
			}				
		}
		return null;
	}
	
	public void getAccountAsync(Long id) {
		logger.info("Get account async " + id);
		
		publishAccount(getAccount(id));
	}
	
	public AccountDetail getAccountByPhone(String phone) {
		logger.info("Get account by phone " + phone);
		
		List<AccountDetail> accounts = accountRepository.findByPhoneNumber(phone);
		AccountDetail account = null;
		
		if(accounts.size() > 0) {
			logger.info("Found account " + phone);
			account = accounts.get(0);
		}
			
		return account;
	}
	
	public AccountDetail getOrCreateAccountByPhone(String phone) {
		logger.info("Get or create account by phone " + phone);
		
		AccountDetail account = getAccountByPhone(phone);
		
		if(account == null) {
			logger.info("Create now account for " + phone);
			account = new AccountDetail();
			account.setPhoneNumber(phone);
			account.setCurrentBalance(BigDecimal.valueOf((0.00)));
			account.setCreatedDate(DateTimeUtils.currentDateString());	
		}
			
		return account;
	}
	
	public void getOrCreateAccountByPhoneAsync(String phone) {
		logger.info("Get or create account by phone async " + phone);
		
		publishAccount(getOrCreateAccountByPhone(phone));
	}
	
	public AccountDetail saveAccount(AccountDetail account) {
		logger.info("Save account " + account.getId());
		
		return accountRepository.save(account);
	}
	
	public void saveAccountAsync(AccountDetail account) {
		logger.info("Save account async " + account.getId());
		
		publishAccount(saveAccount(account));
	}
	
	public void updateAccountBalance(OrderDetail order, BigDecimal amount) {
		logger.info(String.format("Update account %d balance to %.2f", order.getAccountId(), amount));
		
		AccountDetail account = getAccount(order.getAccountId());
		
		if(account != null) {
			account.updateBalance(amount);
			logger.info(String.format("Updated account %d balance is %.2f", 
					account.getId(), 
					account.getCurrentBalance()));
			
			if(account.getCurrentBalance().compareTo(BigDecimal.ZERO) > 0) {
				account.setCurrentOrderId(order.getId());
			}
			
			saveAccountAsync(account);
		}
	}
	
	public void updateAccount(AccountDetail account) {
		logger.info("Update account " + account.getId());
		
		if(account.getCurrentBalance().compareTo(BigDecimal.ZERO) <= 0) {
			account.setCurrentOrderId(0L);
		}
		
		saveAccountAsync(account);
	}
	
	
	public void deleteAccountById(Long id) {
		logger.info("Delete account " + id);
		deleteOrdersByAccountId(id);
		accountRepository.deleteById(id);
	}
	
	public OrderDetail createOrder(String phone) {
		logger.info("Create order for " + phone);
		
		AccountDetail account = getAccountByPhone(phone);
		OrderDetail order = new OrderDetail();
		
		if(account != null) {
			if(account.getCurrentBalance() == null) {
				account.setCurrentBalance(BigDecimal.valueOf(0.00));
			}
			if(account.getCurrentBalance().compareTo(BigDecimal.ZERO) <= 0) {
				order.setAccountId(account.getId());
				order.setOrderDate(DateTimeUtils.currentDateString());
				order.setOrderStatus(OrderStatus.Created);
			} else {
				order.setError("Account balance is still outstanding, cannot create new order.");
			}
		} else {
			order.setError("Account does not exist for " + phone);
		}
		
		return order;
	}
	
	public OrderDetail saveOrder(OrderDetail order) {
		logger.info("Save order " + order.getId());
		
		BigDecimal amount = order.getOrderAmount();
		
		if(order.getId() != null) {
			OrderDetail exist = getOrder(order.getId());
			amount = amount.subtract(exist.getOrderAmount());
		}
		
		order = orderRepository.save(order);
		updateAccountBalance(order, amount);
		
		return order;
	}
	
	public void saveOrderAsync(OrderDetail order) {		
		logger.info("Save order async " + order.getId());		
		
		publishOrder(saveOrder(order), getAccount(order.getAccountId()).getPhoneNumber());
	}
	
	public void createOrderAsync(String phone) {
		logger.info("Create order async for " + phone);
		
		publishOrder(createOrder(phone), phone);
	}
	
	public OrderDetail getOrder(Long id) {
		logger.info("Get order " + id);
		
		Optional<OrderDetail> order = orderRepository.findById(id);
		
		if(order.isPresent()) {
			return order.get();
		}
		
		return null;
	}
	
	public void getOrderAsync(Long id) {
		logger.info("Get order async " + id);
		
		OrderDetail order = getOrder(id);
		
		if(order != null) {
			publishOrder(order, getAccount(order.getAccountId()).getPhoneNumber());
			
			messagingTemplate.convertAndSend(
					"/desktop/orders/" + getAccount(
							order.getAccountId()).getPhoneNumber(), order);
		}		
	}
	
	public List<OrderDetail> getOrdersByPhone(String phone) {
		logger.info("Get orders by phone " + phone);
		
		AccountDetail account = getAccountByPhone(phone);
		
		if(account != null && account.getId() > 0) {
			return getOrdersByAccountId(account.getId());
		}
				
		return null; 
	}
	
	public void getOrdersByPhoneAsync(String phone) {
		logger.info("Get orders by phone async for " + phone);
		
		List<OrderDetail> orders = getOrdersByPhone(phone);
		
		if(orders != null && orders.size() > 0) {
			orders.forEach((order) -> {
				publishOrder(order, phone);
				try {
					Thread.sleep(100L);
				} catch (InterruptedException e) {
				}
			});
		}
	}
	
	public List<OrderDetail> getOrdersByAccountId(Long accountId) {
		logger.info("Get orders by account " + accountId);
		
		return orderRepository.findByAccountId(accountId);
	}
	
	public void payOrder(PaymentResponse response) {
		logger.info("Pay order for account " + response.getAccountId());
		
		AccountDetail account = getAccount(response.getAccountId());
		
		if(account != null) {
			OrderDetail order = getOrder(account.getCurrentOrderId());
			if(order != null) {
				order.setPaidDate(DateTimeUtils.currentDateString());
				order.setTransactionId(response.getTransactionId());
				order.setPaidDate(DateTimeUtils.currentDateString());
				order.setOrderStatus(OrderStatus.Completed);
				saveOrderAsync(order);
				updateAccountBalance(order, response.getPaymentAmount().negate());
			}
		}
	}
	
	public void deleteOrdersByAccountId(Long id) {
		logger.info("Delete orders for account " + id);

		List<OrderDetail> orders = getOrdersByAccountId(id);
		
		if(orders != null && orders.size() > 0) {
			orders.forEach((order) -> {
				logger.info("Delete order " + order.getId());
				orderRepository.deleteById(order.getId());
			});
		}				
	}
	
	private void publishAccount(AccountDetail account) {
		logger.info("Publish account to : " + "/desktop/account/" + account.getPhoneNumber());
		
		messagingTemplate.convertAndSend(
				"/desktop/account/" + account.getPhoneNumber(), account);
	}
	
	private void publishOrder(OrderDetail order, String phone) {
		logger.info("Publish order to : " + "/desktop/order/" + phone);
		
		messagingTemplate.convertAndSend(
				"/desktop/order/" + phone, order);
	}
	
	public void cleanupRepositories() {
		logger.info("Clean up repositories");
		
		deleteAllOrders();
		deleteAllAccounts();
	}
	
	private void deleteAllAccounts() {
		logger.info("Delete all accounts");
		
		accountRepository.deleteAll();
	}
	
	private void deleteAllOrders() {
		logger.info("Delete all orders");
		
		orderRepository.deleteAll();
	}
}
