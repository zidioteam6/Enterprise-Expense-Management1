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
			return expenseRepository.save(expense);
		}
}
