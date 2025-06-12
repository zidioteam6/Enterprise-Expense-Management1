package com.expense.management.services;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.expense.management.dto.DashboardDTO;
import com.expense.management.dto.DashboardDTO.ExpenseSummaryDTO;
import com.expense.management.model.Expense;
import com.expense.management.model.ExpenseStatus;
import com.expense.management.repository.ExpenseRepository;

@Service
public class DashboardService {

    @Autowired
    private ExpenseRepository expenseRepository;

    public DashboardDTO getDashboardData() {
        List<Expense> allExpenses = expenseRepository.findAll();
        DashboardDTO dashboard = new DashboardDTO();

        // Calculate total expenses
        dashboard.setTotalExpenses(allExpenses.stream()
                .mapToDouble(Expense::getAmount)
                .sum());

        // Calculate expenses by status
        dashboard.setPendingExpenses(calculateExpensesByStatus(allExpenses, ExpenseStatus.PENDING));
        dashboard.setApprovedExpenses(calculateExpensesByStatus(allExpenses, ExpenseStatus.APPROVED));
        dashboard.setRejectedExpenses(calculateExpensesByStatus(allExpenses, ExpenseStatus.REJECTED));

        // Calculate expenses by category
        dashboard.setExpensesByCategory(calculateExpensesByCategory(allExpenses));

        // Get recent expenses
        dashboard.setRecentExpenses(getRecentExpenses(allExpenses));

        // Calculate monthly expenses
        dashboard.setMonthlyExpenses(calculateMonthlyExpenses(allExpenses));

        // Calculate status counts
        dashboard.setStatusCounts(calculateStatusCounts(allExpenses));

        return dashboard;
    }

    private double calculateExpensesByStatus(List<Expense> expenses, ExpenseStatus status) {
        return expenses.stream()
                .filter(e -> e.getApprovalStatus() == status)
                .mapToDouble(Expense::getAmount)
                .sum();
    }

    private Map<String, Double> calculateExpensesByCategory(List<Expense> expenses) {
        return expenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.summingDouble(Expense::getAmount)));
    }

    private List<ExpenseSummaryDTO> getRecentExpenses(List<Expense> expenses) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        return expenses.stream()
                .sorted((e1, e2) -> e2.getDate().compareTo(e1.getDate()))
                .limit(5)
                .map(expense -> {
                    ExpenseSummaryDTO summary = new ExpenseSummaryDTO();
                    summary.setId(expense.getId());
                    summary.setAmount(expense.getAmount());
                    summary.setCategory(expense.getCategory());
                    summary.setDescription(expense.getDescription());
                    summary.setDate(expense.getDate().format(formatter));
                    summary.setStatus(expense.getApprovalStatus().name());
                    summary.setPriority(expense.getPriority());
                    return summary;
                })
                .collect(Collectors.toList());
    }

    private Map<String, Double> calculateMonthlyExpenses(List<Expense> expenses) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        return expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getDate().format(formatter),
                        Collectors.summingDouble(Expense::getAmount)));
    }

    private Map<String, Integer> calculateStatusCounts(List<Expense> expenses) {
        Map<String, Integer> statusCounts = new HashMap<>();
        for (ExpenseStatus status : ExpenseStatus.values()) {
            long count = expenses.stream()
                    .filter(e -> e.getApprovalStatus() == status)
                    .count();
            statusCounts.put(status.name(), (int) count);
        }
        return statusCounts;
    }
} 