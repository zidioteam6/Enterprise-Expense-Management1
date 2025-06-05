package com.expense.management.dao;

import org.springframework.stereotype.Repository;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.query.Query;
import com.expense.management.model.Settings;
import com.expense.management.util.HibernateUtil;

@Repository
public class SettingsDAO {

    public Settings getSettings() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Settings> query = session.createQuery("FROM Settings", Settings.class);
            return query.uniqueResult();
        }
    }

    public Settings saveSettings(Settings settings) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction transaction = session.beginTransaction();
            try {
                session.saveOrUpdate(settings);
                transaction.commit();
                return settings;
            } catch (Exception e) {
                if (transaction != null) {
                    transaction.rollback();
                }
                throw e;
            }
        }
    }
} 