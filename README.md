# Đại Việt Hiệp Khách

Game nhập vai hành động lấy bối cảnh lịch sử Việt Nam, chạy thẳng trên trình duyệt và iPhone. Có 6 môn phái, 6 chương từ Văn Lang đến Đống Đa, đánh quái nhặt đồ, rèn trang bị, thú cưỡi và một thành chính có tường bao để nghỉ chân.

**Chơi ngay:** mở `index.html` (hoặc trang GitHub Pages của repo).

## Có gì trong game
- **Bí kíp:** mỗi lần lên cấp chọn 1 trong 3 bí kíp (24 loại, mỗi loại 5 cấp). Hai bí kíp hợp nhau cùng đạt cấp 3 thì ghép thành Tuyệt kỹ (7 loại).
- **Đồ Huyền Thoại:** 14 món mang tên tích sử Việt, mỗi món có hiệu ứng riêng. Có cơ chế bảo đảm: chơi hết game thường nhặt được 3–6 món.
- **Ép đồ rủi ro kiểu MU:** từ +10 thất bại có thể vỡ đồ, Bùa Bảo Hộ giữ được đồ.
- **Boss ba giai đoạn:** mỗi boss có chiêu báo trước và một cơ chế cần đứng đúng chỗ (dụ vào bãi cọc Bạch Đằng, nấp Hốc Đá, phá Hỏa Đàn…).
- **Ngũ Hành tương khắc:** giữa môn phái và quái, đánh vào hệ bị khắc mạnh hơn 25%.
- **Thành chính:** tường bao, hồ sen, 7 nhà có chức năng.

## Điều khiển
- **Điện thoại:** kéo ở nửa trái màn hình để di chuyển, nút đỏ để đánh, ba nút kỹ năng bên cạnh.
- **Bàn phím:** WASD di chuyển, J đánh, K / L / I kỹ năng, E nói chuyện với NPC, B túi đồ, R lò rèn, C chợ, T kỹ năng, Q nhiệm vụ, M bản đồ, V thú cưỡi, Esc cài đặt.

## Cấu trúc
| Đường dẫn | Nội dung |
|---|---|
| `index.html` | Bản game đã ghép, một file duy nhất |
| `src/` | Mã nguồn chia theo phần: dữ liệu, thế giới, nhân vật, thành chính, vật phẩm, quái, vòng lặp game, hiệu ứng, giao diện. Mô-đun mở rộng `perks.js`, `legend.js`, `boss2.js` cắm vào qua điểm nối `HK` trong `core.js` |
| `build.sh` | Ghép `src/` thành `dist/dai-viet-hiep-khach.html` |
| `styles/` | Trang so sánh 10 phong cách vẽ (`dist/phong-cach-ve.html`) |
| `t/` | Kiểm thử Playwright: giao diện, bàn phím, bot tự chơi, đo hiệu năng |

## Dựng lại
```bash
bash build.sh   # tạo dist/ và cập nhật index.html (bản đứng riêng có đủ khung trang)
```

## Kiểm thử
```bash
cd t && npm install @fontsource/be-vietnam-pro @fontsource/yeseva-one gsap@3.12.5 three@0.128.0
pip install playwright
python3 ui_test.py   # 69 bước trên iPhone, iPhone SE, màn ngang, máy tính
python3 keys.py      # phím tắt và chuột
python3 bot.py kiem 18   # bot tự chơi 18 phút giả lập
```

## Móc cho ứng dụng iPhone (WebView)
- `window.DVHK.pause()`, `window.DVHK.resume()`, `window.DVHK.getState()`
- Game gửi sự kiện qua `webkit.messageHandlers.dvhk` (lên cấp, qua chương).
