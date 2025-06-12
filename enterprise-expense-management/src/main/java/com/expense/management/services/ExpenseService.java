package com.expense.management.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.expense.management.enums.ApprovalLevel;
import com.expense.management.model.Expense;
import com.expense.management.model.ExpenseStatus;
import com.expense.management.repository.ExpenseRepository;

@Service
public class ExpenseService  {
	ExpenseRepository expenseRepository;
	
	ExpenseService(ExpenseRepository expenseRepository){
		this.expenseRepository=expenseRepository;
	}
		
	 
		public List<Expense> getAll() {
			// TODO Auto-generated method stub
			return expenseRepository.findAll();
		}
		
		public Expense add(Expense expense){
			if (expense.getAmount()<3000) {
				expense.setPriority("Low");
				
			} else if(expense.getAmount()<20000){
				expense.setPriority("Medium");
			}else {
				expense.setPriority("High");
			}
			return expenseRepository.save(expense);
		}
		
		
		public boolean approve(long id){
			Expense expense = expenseRepository.findById(id).orElseThrow(()-> new RuntimeException("expense not found!"));
			if (expense.getApprovalLevel()==ApprovalLevel.MANAGER) {
				expense.setApprovalLevel(ApprovalLevel.SUPER_MANAGER);
				expenseRepository.save(expense);

				return true;
			} else if (expense.getApprovalLevel() == ApprovalLevel.SUPER_MANAGER) 
			{
				expense.setApprovalLevel(ApprovalLevel.ADMIN);
				expenseRepository.save(expense);

				return true;
			} else if (expense.getApprovalLevel() == ApprovalLevel.ADMIN)
			{
				expense.setApprovalStatus(ExpenseStatus.APPROVED);
				expenseRepository.save(expense);
				return true;
			}
			return false;
		}
}
