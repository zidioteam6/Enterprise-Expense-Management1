package com.expense.management.controller;

import com.expense.management.model.Budget;
import com.expense.management.model.Expense;
import com.expense.management.model.ExpenseStatus;
import com.expense.management.util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.query.Query;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.nio.charset.StandardCharsets;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import com.expense.management.services.AuditService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private AuditService auditService;

    @PostMapping
    public ResponseEntity<Expense> addExpense(
            @RequestParam("amount") double amount,
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam("date") String date,
            @RequestParam(value = "invoice", required = false) MultipartFile invoice) {
        Transaction transaction = null;
        Expense expense = new Expense();
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            expense.setAmount(amount);
            expense.setCategory(category);
            expense.setDescription(description);
            expense.setDate(LocalDate.parse(date));
            expense.setApprovalStatus(ExpenseStatus.PENDING);

            if (invoice != null && !invoice.isEmpty()) {
                expense.setAttachment(invoice.getBytes());
                expense.setAttachmentType(invoice.getContentType());
            }

            transaction = session.beginTransaction();
            session.save(expense);
            transaction.commit();
            auditService.logEvent("user", "ADD", "Added expense (ID: " + expense.getId() + ")", "SUCCESS");
            return ResponseEntity.ok(expense);
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public List<Expense> getAllExpenses() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.createQuery("from Expense", Expense.class).list();
        }
    }

    @GetMapping("/total")
    public double getTotalExpenses() {
        double totalExpenses = 0.0;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Double> query = session.createQuery("select sum(e.amount) from Expense e", Double.class);
            totalExpenses = query.uniqueResult();
        }
        return totalExpenses;
    }

    @GetMapping("/category/{category}")
    public double getTotalExpensesByCategory(@PathVariable String category) {
        double totalExpenses = 0.0;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Double> query = session.createQuery("select sum(e.amount) from Expense e where e.category = :category", Double.class);
            query.setParameter("category", category);
            Double result = query.uniqueResult();
            if (result != null) {
                totalExpenses = result.doubleValue();
            }
        }
        return totalExpenses;
    }

    @PostMapping("/budget")
    public String setBudget(@RequestBody Budget budget) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            session.saveOrUpdate(budget);
            transaction.commit();
            return "Budget set successfully!";
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            return "Error setting budget.";
        }
    }

    @GetMapping("/category-budget/{category}")
    public Budget getBudgetByCategory(@PathVariable String category) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Budget> query = session.createQuery("from Budget where category = :category", Budget.class);
            query.setParameter("category", category);
            return query.uniqueResult();
        }
    }

    @DeleteMapping("/{expenseId}")
    public String deleteExpense(@PathVariable Long expenseId) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            Expense expense = session.get(Expense.class, expenseId);
            if (expense != null) {
                session.delete(expense);
                transaction.commit();
                return "Expense deleted successfully!";
            }
            return "Expense not found.";
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            return "Error deleting expense.";
        }
    }

    @GetMapping("/month/{year}/{month}")
    public List<Expense> getExpensesByMonth(@PathVariable int year, @PathVariable int month) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Expense> query = session.createQuery("FROM Expense WHERE YEAR(date) = :year AND MONTH(date) = :month", Expense.class);
            query.setParameter("year", year);
            query.setParameter("month", month);
            return query.list();
        }
    }

    @GetMapping("/year/{year}")
    public List<Expense> getExpensesByYear(@PathVariable int year) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Expense> query = session.createQuery("FROM Expense WHERE YEAR(date) = :year", Expense.class);
            query.setParameter("year", year);
            return query.list();
        }
    }

    @GetMapping("/category-wise")
    public Map<String, Double> getCategoryWiseExpenseData() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Object[]> query = session.createQuery("SELECT category, SUM(amount) FROM Expense GROUP BY category", Object[].class);
            List<Object[]> results = query.list();

            Map<String, Double> categoryExpenseMap = new HashMap<>();
            for (Object[] result : results) {
                String category = (String) result[0];
                Double totalExpense = (Double) result[1];
                categoryExpenseMap.put(category, totalExpense);
            }
            return categoryExpenseMap;
        }
    }

    // New endpoint to fetch expenses grouped by approval status (approved vs. not approved)
    @GetMapping("/by-approval-status")
    public Map<String, List<Expense>> getExpensesByApprovalStatus() {
        Map<String, List<Expense>> result = new HashMap<>();
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            // Fetch approved expenses (status = APPROVED)
            Query<Expense> approvedQuery = session.createQuery("FROM Expense WHERE approvalStatus = :status", Expense.class);
            approvedQuery.setParameter("status", ExpenseStatus.APPROVED);
            List<Expense> approvedExpenses = approvedQuery.list();
            result.put("approved", approvedExpenses);

            // Fetch non-approved expenses (status = PENDING or REJECTED)
            Query<Expense> notApprovedQuery = session.createQuery("FROM Expense WHERE approvalStatus IN (:pending, :rejected)", Expense.class);
            notApprovedQuery.setParameter("pending", ExpenseStatus.PENDING);
            notApprovedQuery.setParameter("rejected", ExpenseStatus.REJECTED);
            List<Expense> notApprovedExpenses = notApprovedQuery.list();
            result.put("notApproved", notApprovedExpenses);
        }
        return result;
    }

    // Approve expense by ID
    @PutMapping("/{id}/approve")
    public String approveExpense(@PathVariable Long id) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();

            Expense expense = session.get(Expense.class, id);
            if (expense == null) {
                return "Expense not found.";
            }

            expense.setApprovalStatus(ExpenseStatus.APPROVED);
            session.update(expense);

            transaction.commit();
            auditService.logEvent("user", "APPROVE", "Approved expense (ID: " + expense.getId() + ")", "SUCCESS");
            return "Expense approved successfully!";
        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            e.printStackTrace();
            return "Error approving expense.";
        }
    }

    // Reject expense by ID
    @PutMapping("/{id}/reject")
    public String rejectExpense(@PathVariable Long id) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();

            Expense expense = session.get(Expense.class, id);
            if (expense == null) {
                return "Expense not found.";
            }

            expense.setApprovalStatus(ExpenseStatus.REJECTED);
            session.update(expense);

            transaction.commit();
            return "Expense rejected successfully!";
        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            e.printStackTrace();
            return "Error rejecting expense.";
        }
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportExpensesAsCSV() {
        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.append("ID,Amount,Category,Description,Date,Approval Status\n");
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            List<Expense> expenses = session.createQuery("from Expense", Expense.class).list();
            for (Expense e : expenses) {
                csvBuilder.append(e.getId()).append(",")
                          .append(e.getAmount()).append(",")
                          .append(e.getCategory()).append(",")
                          .append(e.getDescription() != null ? e.getDescription().replace(",", " ") : "").append(",")
                          .append(e.getDate()).append(",")
                          .append(e.getApprovalStatus()).append("\n");
            }
        }
        byte[] csvBytes = csvBuilder.toString().getBytes(StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=expenses_report.csv");
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        return ResponseEntity.ok().headers(headers).body(csvBytes);
    }
}



