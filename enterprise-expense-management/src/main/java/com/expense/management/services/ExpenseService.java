package com.expense.management.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.expense.management.model.Expense;
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
}
