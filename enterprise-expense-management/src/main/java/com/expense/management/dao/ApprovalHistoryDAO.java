package com.expense.management.dao;

import org.springframework.stereotype.Repository;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.query.Query;
import com.expense.management.model.ApprovalHistory;
import com.expense.management.model.ApprovalStage;
import com.expense.management.util.HibernateUtil;
import java.util.List;

@Repository
public class ApprovalHistoryDAO {

    public List<ApprovalHistory> getApprovalHistoryByExpenseId(Long expenseId) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<ApprovalHistory> query = session.createQuery(
                "FROM ApprovalHistory WHERE expenseId = :expenseId ORDER BY actionDate ASC", 
                ApprovalHistory.class
            );
            query.setParameter("expenseId", expenseId);
            return query.list();
        }
    }

    public List<ApprovalHistory> getApprovalHistoryByStage(ApprovalStage stage) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<ApprovalHistory> query = session.createQuery(
                "FROM ApprovalHistory WHERE stage = :stage ORDER BY actionDate DESC", 
                ApprovalHistory.class
            );
            query.setParameter("stage", stage);
            return query.list();
        }
    }

    public List<ApprovalHistory> getApprovalHistoryByApproverId(Long approverId) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<ApprovalHistory> query = session.createQuery(
                "FROM ApprovalHistory WHERE approverId = :approverId ORDER BY actionDate DESC", 
                ApprovalHistory.class
            );
            query.setParameter("approverId", approverId);
            return query.list();
        }
    }

    public ApprovalHistory saveApprovalHistory(ApprovalHistory approvalHistory) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction transaction = session.beginTransaction();
            try {
                session.saveOrUpdate(approvalHistory);
                transaction.commit();
                return approvalHistory;
            } catch (Exception e) {
                transaction.rollback();
                throw e;
            }
        }
    }

    public void deleteApprovalHistoryByExpenseId(Long expenseId) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction transaction = session.beginTransaction();
            try {
                Query query = session.createQuery("DELETE FROM ApprovalHistory WHERE expenseId = :expenseId");
                query.setParameter("expenseId", expenseId);
                query.executeUpdate();
                transaction.commit();
            } catch (Exception e) {
                transaction.rollback();
                throw e;
            }
        }
    }

    public List<ApprovalHistory> getAllApprovalHistory() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<ApprovalHistory> query = session.createQuery(
                "FROM ApprovalHistory ORDER BY actionDate DESC", 
                ApprovalHistory.class
            );
            return query.list();
        }
    }
} 