package com.cisco.wcc.payassist.account.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cisco.wcc.payassist.account.pojo.OrderDetail;

public interface OrderRepository extends JpaRepository<OrderDetail, Long> {

	@Override
	Optional<OrderDetail> findById(Long id);
	
	List<OrderDetail> findByAccountId(Long accountId);
}
