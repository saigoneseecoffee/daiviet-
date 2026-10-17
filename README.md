# Đại Việt Hiệp Khách

Game nhập vai hành động lấy bối cảnh lịch sử Việt Nam, chạy thẳng trên trình duyệt và iPhone. Có 6 môn phái, 6 chương từ Văn Lang đến Đống Đa, đánh quái nhặt đồ, rèn trang bị, thú cưỡi và một thành chính có tường bao để nghỉ chân.

**Chơi ngay:** mở `index.html` (hoặc trang GitHub Pages của repo).

## Có gì trong game
- **12 chương theo dòng sử Việt:** Phong Châu, Cổ Loa, Mê Linh, Vạn Xuân, Bạch Đằng, Hoa Lư, Như Nguyệt, Tây Kết, Vạn Kiếp, Chi Lăng, Rạch Gầm, Đống Đa. Mỗi chương có 10 bước nhiệm vụ và một boss ba giai đoạn.
- **Tiến trình dài hạn:** cấp tối đa 300. Kỹ năng lên tới cấp 20; từ cấp 11 cần Tàn Quyển. 12 Cảnh Giới, Kinh Mạch 8 mạch × 12 huyệt nhiều tầng. Luân Hồi vô hạn vòng.
- **Vượt Tháp:** tháp vô hạn tầng ở Bảo Tháp trong thành, biến thể đổi mỗi tuần, quét tháp hằng ngày.
- **Hoạt động:** nhiệm vụ ngày và tuần, điểm danh 7 và 30 ngày, 46 thành tựu và danh hiệu, lễ hội theo lịch âm (Tết, Giỗ Tổ, Trung Thu, Quốc Khánh), Bế quan nhận thưởng khi vắng mặt, sao lưu và khôi phục dữ liệu.
- **Bí kíp khi lên cấp:** chọn 1 trong 3, có 7 Tuyệt kỹ ghép đôi.
- **Đồ Huyền Thoại:** 14 món. Ép đồ có rủi ro vỡ kiểu MU.
- **Ngũ Hành tương khắc. Thành chính:** tường bao, hồ sen, 8 nhà có chức năng.

## Điều khiển
- **Điện thoại:** kéo ở nửa trái màn hình để di chuyển, nút đỏ để đánh, ba nút kỹ năng bên cạnh.
- **Bàn phím:** WASD di chuyển, J đánh, K / L / I kỹ năng, E nói chuyện với NPC, B túi đồ, R lò rèn, C chợ, T kỹ năng, Q nhiệm vụ, M bản đồ, V thú cưỡi, Esc cài đặt.

## Cấu trúc
| Đường dẫn | Nội dung |
|---|---|
| `index.html` | Bản game đã ghép, một file duy nhất |
| `src/` | Mã nguồn chia theo phần: dữ liệu, thế giới, nhân vật, thành chính, vật phẩm, quái, vòng lặp game, hiệu ứng, giao diện. Mô-đun mở rộng `perks.js`, `legend.js`, `boss2.js`, `prog.js`, `chapters.js`, `tower.js`, `daily.js` cắm vào qua điểm nối `HK` trong `core.js` |
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
