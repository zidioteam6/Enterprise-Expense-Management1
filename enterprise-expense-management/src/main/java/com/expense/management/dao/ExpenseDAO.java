package com.expense.management.dao;

import org.springframework.stereotype.Repository;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.query.Query;
import com.expense.management.model.Expense;
import com.expense.management.model.ExpenseStatus;
import com.expense.management.util.HibernateUtil;
import java.util.List;

@Repository
public class ExpenseDAO {

    public List<Expense> getAllExpenses() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Expense> query = session.createQuery("FROM Expense", Expense.class);
            return query.list();
        }
    }

    public List<Expense> getExpensesByStatus(ExpenseStatus status) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Expense> query = session.createQuery(
                "FROM Expense WHERE approvalStatus = :status", 
                Expense.class
            );
            query.setParameter("status", status);
            return query.list();
        }
    }

    public List<Expense> getExpensesByStatuses(List<ExpenseStatus> statuses) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Expense> query = session.createQuery(
                "FROM Expense WHERE approvalStatus IN :statuses", 
                Expense.class
            );
            query.setParameterList("statuses", statuses);
            return query.list();
        }
    }

    public List<Expense> getExpensesByEmployeeId(Long employeeId) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Expense> query = session.createQuery(
                "FROM Expense WHERE employeeId = :employeeId", 
                Expense.class
            );
            query.setParameter("employeeId", employeeId);
            return query.list();
        }
    }

    public Expense getExpenseById(Long id) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.get(Expense.class, id);
        }
    }

    public Expense saveExpense(Expense expense) {
        Session session = null;
        Transaction transaction = null;
        try {
            session = HibernateUtil.getSessionFactory().openSession();
            transaction = session.beginTransaction();
            
            // Merge instead of saveOrUpdate to handle detached entities better
            Expense mergedExpense = (Expense) session.merge(expense);
            transaction.commit();
            return mergedExpense;
        } catch (Exception e) {
            if (transaction != null && transaction.isActive()) {
                transaction.rollback();
            }
            System.err.println("Error saving expense: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save expense: " + e.getMessage(), e);
        } finally {
            if (session != null && session.isOpen()) {
                session.close();
            }
        }
    }
} 