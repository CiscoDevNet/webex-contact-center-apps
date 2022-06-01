package com.cisco.wcc.payassist.account.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cisco.wcc.payassist.account.pojo.AccountDetail;

public interface AccountRepository extends JpaRepository<AccountDetail, Long> {

	@Override
	Optional<AccountDetail> findById(Long id);
	
	List<AccountDetail> findByPhoneNumber(String phoneNumber);
	
	
}
