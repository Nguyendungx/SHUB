import axios from "axios";
import XLSX from "xlsx";

const fetchAndProcessSheet = async () => {
  try {
    const url = "https://go.microsoft.com/fwlink/?LinkID=521962";

    const response = await axios.get(url, { responseType: "arraybuffer" });
    // Đọc file Excel 
    const workbook = XLSX.read(response.data, { type: "buffer" });

    // Lấy sheet 1
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Chuyển dữ liệu trong sheet thành JSON
    const data = XLSX.utils.sheet_to_json(sheet);

    // Loại bỏ khoảng trắng ở đầu/cuối cơ bản
    const normalizedData = data.map((row) => {
      const normalizedRow = {};
      for (const key in row) {
        const normalizedKey = key.trim(); // Loại bỏ khoảng trắng ở đầu/cuối
        normalizedRow[normalizedKey] = row[key];
      }
      return normalizedRow;
    });

    // Lọc các hàng có "Sales" > 50,000
    const filteredData = normalizedData.filter((row) => {
      const sales = row["Sales"] || row[" Sales "] || "0"; 
      const salesValue = parseFloat(sales.toString().replace(/[$,]/g, "")); // Chuyển đổi thành số
      return sales > 50000; 
    });

    // Kiểm tra nếu không có hàng nào đạt điều kiện
    if (filteredData.length === 0) {
      console.log("Không có hàng nào có Sales > 50,000.");
      return;
    }

    // Tạo file Excel mới chứa các hàng đã lọc
    const newWorkbook = XLSX.utils.book_new();
    const newSheet = XLSX.utils.json_to_sheet(filteredData);
    XLSX.utils.book_append_sheet(newWorkbook, newSheet, "FilteredData");
    XLSX.writeFile(newWorkbook, "FilteredSales.xlsx");

    console.log("File đã được tạo thành công: FilteredSales.xlsx");
  } catch (error) {
    console.error("Đã xảy ra lỗi:", error.message);
    if (error.response) {
      console.error(
        `Chi tiết lỗi API: ${error.response.status} - ${error.response.statusText}`
      );
    } else if (error.code === "ENOTFOUND") {
      console.error("Không thể kết nối đến URL. Vui lòng kiểm tra kết nối mạng.");
    } else {
      console.error("Chi tiết lỗi:", error);
    }
  }
};

// Gọi hàm xử lý
fetchAndProcessSheet();
