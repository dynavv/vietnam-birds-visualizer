# HƯỚNG DẪN TRIỂN KHAI LÊN GOOGLE CLOUD RUN (+10 ĐIỂM THƯỞNG HACKATHON)

Dự án **Avifauna of Vietnam** đã được chuẩn bị sẵn `Dockerfile` và `nginx.conf` chuẩn Cloud Run. Bạn có thể chọn 1 trong 2 cách dưới đây để deploy và lấy Live URL công khai (`https://vietnam-birds-...run.app`).

---

## Cách 1: Deploy Bằng `gcloud CLI` (Nhanh Nhất, 2 Phút)

### Bước 1: Cài đặt & Đăng nhập Google Cloud SDK
Nếu máy bạn đã có `gcloud`:
```bash
gcloud auth login
gcloud config set project YOUR_GOOGLE_CLOUD_PROJECT_ID
```

### Bước 2: Deploy trực tiếp từ mã nguồn lên Cloud Run
Chạy lệnh duy nhất sau tại thư mục gốc dự án:
```bash
gcloud run deploy vietnam-birds-visualizer \
  --source . \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

> **Giải thích tham số:**
> - `--region asia-southeast1`: Triển khai tại khu vực Singapore (tốc độ cao nhất về Việt Nam).
> - `--allow-unauthenticated`: Cho phép mọi người truy cập công khai không cần đăng nhập.
> - Sau khi lệnh hoàn tất, Terminal sẽ in ra đường link công khai, ví dụ: `https://vietnam-birds-visualizer-xxxx-as.a.run.app`.

---

## Cách 2: Deploy Qua Giao Diện Google Cloud Console

1. Truy cập **Google Cloud Console**: [https://console.cloud.google.com/run](https://console.cloud.google.com/run).
2. Nhấn nút **Create Service** (Tạo dịch vụ).
3. Chọn mục **Continuously deploy from a repository** (hoặc upload code từ GitHub/Cloud Build).
4. Cấu hình:
   - **Service name**: `vietnam-birds-visualizer`
   - **Region**: `asia-southeast1 (Singapore)`
   - **Authentication**: Chọn *Allow unauthenticated invocations*.
   - **Container Port**: `8080`
5. Nhấn **Create** ➡️ Đợi ~1-2 phút để nhận URL ứng dụng.

---

## Cách 3: 1-Click Deploy Từ Google AI Studio (Starter Tier)

Nếu bạn sử dụng **Build Mode** trên Google AI Studio:
1. Mở project trong AI Studio.
2. Bấm nút **Publish / Deploy to Cloud Run** ở thanh công cụ.
3. Chọn gói **Google Cloud Starter Tier** (miễn phí, không cần add thẻ thanh toán).
4. Hệ thống sẽ tự động cấp phát URL Cloud Run cho bạn.

---

👉 **Sau khi có link Cloud Run, hãy dán vào ô "A live Google Cloud Run or Google Play Link" trong form nộp bài để nhận trọn vẹn +10 điểm Bonus Deployment!**
