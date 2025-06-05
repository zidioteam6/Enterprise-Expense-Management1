package com.expense.management.dao;

import org.springframework.stereotype.Repository;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.query.Query;
import com.expense.management.model.Budget;
import com.expense.management.util.HibernateUtil;
import java.util.List;

@Repository
public class BudgetDAO {

    public List<Budget> getAllBudgets() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Budget> query = session.createQuery("FROM Budget", Budget.class);
            return query.list();
        }
    }

    public Budget getBudgetByCategory(String category) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Budget> query = session.createQuery(
                "FROM Budget WHERE category = :category", 
                Budget.class
            );
            query.setParameter("category", category);
            return query.uniqueResult();
        }
    }

    public Budget saveBudget(Budget budget) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction transaction = session.beginTransaction();
            try {
                session.saveOrUpdate(budget);
                transaction.commit();
                return budget;
            } catch (Exception e) {
                if (transaction != null) {
                    transaction.rollback();
                }
                throw e;
            }
        }
    }
} 