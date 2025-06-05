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

    public Expense getExpenseById(Long id) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.get(Expense.class, id);
        }
    }

    public Expense saveExpense(Expense expense) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction transaction = session.beginTransaction();
            try {
                session.saveOrUpdate(expense);
                transaction.commit();
                return expense;
            } catch (Exception e) {
                if (transaction != null) {
                    transaction.rollback();
                }
                throw e;
            }
        }
    }
} 