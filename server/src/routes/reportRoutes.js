// reportRoutes.js
import express from "express";
const router = express.Router();
import { getSalesReport } from "../controllers/reportController";

// GET /api/reports/inventory-overview?startDate=X&endDate=Y
// GET /api/reports/category-breakdown?startDate=X&endDate=Y
// GET /api/reports/stock-trends?startDate=X&endDate=Y
// POST /api/reports/export/excel

// Sales report
router.get("/sales", getSalesReport);
export default router;

    await size.destroy();
    res.json({ message: "Size deleted successfully" });
    } catch (error) {   
    res.status(500).json({ error: error.message });
    }
module.exports = router;

module.exports = router;
    } catch (error) {
