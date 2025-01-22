const fetchData = async () => {
    const apiUrl = 'https://share.shub.edu.vn/api/intern-test/input';
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };
  
  const solve = async () => {
    const data = await fetchData();
    if (!data) return;
  
    const { token, data: nums, query } = data;
  
    // Tạo prefix sum cho loại 1
    const prefixSum = [0];
    for (let i = 0; i < nums.length; i++) {
      prefixSum.push(prefixSum[i] + nums[i]);
    }
  
    // Tạo prefix sum cho các phần tử chẵn và lẻ
    const evenSum = [0];
    const oddSum = [0];
    for (let i = 0; i < nums.length; i++) {
      evenSum.push(evenSum[i] + (i % 2 === 0 ? nums[i] : 0));
      oddSum.push(oddSum[i] + (i % 2 === 1 ? nums[i] : 0));
    }
  
    // Xử lý các truy vấn
    const results = query.map(({ range, type }) => {
      const [l, r] = range;
      
      if (type === "1") {
        // Truy vấn loại 1: Tính tổng các phần tử trong khoảng [l, r]
        return prefixSum[r + 1] - prefixSum[l];
      } else if (type === "2") {
        // Truy vấn loại 2: Tính tổng các phần tử chẵn - tổng các phần tử lẻ trong khoảng [l, r]
        const sumEven = evenSum[r + 1] - evenSum[l];
        const sumOdd = oddSum[r + 1] - oddSum[l];
        return sumEven - sumOdd;
      }
    });
  
    // Kiểm tra xem 'results' có phải là mảng không
    if (!Array.isArray(results)) {
      console.error('Results is not an array:', results);
      return;
    }
  
    console.log(results);
  
    // Gửi kết quả lên API
    const outputApiUrl = 'https://share.shub.edu.vn/api/intern-test/output';
    const outputData = {
      results, // Đảm bảo results là mảng
    };
  
    try {
      const outputResponse = await fetch(outputApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(results)
      });
  
      const result = await outputResponse.json();
      console.log('Output result:', result);
    } catch (error) {
      console.error('Error sending output:', error);
    }
  };
  
  // Gọi hàm giải quyết
  solve();
  