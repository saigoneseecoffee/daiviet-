/* ============ KỲ NGỘ (nhiemvu.js): hoạt động phụ ngoài chuỗi "hạ N quái" ============
   1. Đố Sử Việt: Ông Đồ trong thành ra 5 câu mỗi ngày; mỗi chương có 2 Bia Đá, trả lời đúng mở một trang Sử Ký (thưởng một lần).
   2. Câu Cá ở hồ sen giữa thành: quăng cần, chờ phao chìm, giật đúng lúc, giữ dây trong vùng xanh. 10 loài cá, Ngư Phổ ghi kỷ lục.
   3. Áp Tiêu: hộ tống xe bò chở hàng từ cổng bắc tới trạm dịch theo đường mòn chương hiện tại; cướp phục kích theo đợt. 3 chuyến/ngày.
   4. Rương Bí Ẩn: chìa khóa đồng rơi từ quái tinh anh/boss, mỗi chương 3 rương khóa giấu ở chỗ khuất (mở lại mỗi ngày).
   Thẻ "Kỳ Ngộ" trong bảng Võ Đạo (HUB) tóm tắt tiến độ hôm nay và chỉ đường (mũi tên vàng của nhiệm vụ).
   Lưu trong G.save.nv (tạo lười). Bọc: makeWorld, drawNpc, questTarget, updateEnemies, updateDrops, die, travel, showTitle,
   UI.open, UI.npcPrompt, UI.renderTracker. Móc: tick, kill, drawWorld, drawScreen. Xuất: window.NV */
(function(){
'use strict';
const SP=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
/* ================= DỮ LIỆU: CÂU ĐỐ SỬ VIỆT =================
   [thời kỳ, câu hỏi, [đáp án đúng, sai, sai, sai], giải thích một câu]. Đáp án đúng luôn đứng đầu trong dữ liệu, xáo khi hiện.
   Chỉ thêm vào cuối mảng: chỉ số câu dùng làm mã trong lưu. */
const ERA={hv:['Hùng Vương',0],adv:['An Dương Vương',1],hbt:['Hai Bà Trưng',2],vx:['Bà Triệu · Lý Nam Đế',3],nq:['Ngô Quyền',4],
  dinh:['Đinh · Tiền Lê',5],ly:['Nhà Lý',6],tran:['Nhà Trần',7],ho:['Nhà Hồ',9],ls:['Lam Sơn',9],ts:['Tây Sơn',10]};
const MAPERA=['hv','adv','hbt','vx','nq','dinh','ly','tran','tran','ls','ts','ts'];
const QZ=[
 ['hv','Theo sử truyền thống, nhà nước đầu tiên của người Việt có tên là gì?',['Văn Lang','Âu Lạc','Vạn Xuân','Đại Cồ Việt'],'Nước Văn Lang do các Vua Hùng dựng lên, là nhà nước đầu tiên trong sử Việt.'],
 ['hv','Kinh đô của nước Văn Lang đặt ở đâu?',['Phong Châu','Cổ Loa','Hoa Lư','Mê Linh'],'Phong Châu nằm ở vùng Việt Trì, Phú Thọ, nơi ba con sông gặp nhau.'],
 ['hv','Theo truyền thuyết, Âu Cơ sinh ra một bọc trứng nở thành bao nhiêu người con?',['100','50','18','12'],'Bọc trăm trứng nở trăm con: năm mươi theo cha xuống biển, năm mươi theo mẹ lên núi.'],
 ['hv','Theo truyền thống, nước Văn Lang trải qua bao nhiêu đời Hùng Vương?',['18 đời','10 đời','9 đời','32 đời'],'Sử cũ chép mười tám đời Hùng Vương nối nhau trị vì nước Văn Lang.'],
 ['hv','Người anh hùng nhỏ tuổi cưỡi ngựa sắt đánh đuổi giặc Ân là ai?',['Thánh Gióng','Sơn Tinh','Chử Đồng Tử','Mai An Tiêm'],'Thánh Gióng vươn vai thành tráng sĩ, nhổ tre đánh tan giặc Ân thời Hùng Vương thứ sáu.'],
 ['hv','Sau khi thắng giặc Ân, Thánh Gióng bay về trời từ ngọn núi nào?',['Núi Sóc','Núi Tản Viên','Núi Nghĩa Lĩnh','Núi Yên Tử'],'Gióng phi ngựa lên núi Sóc (Sóc Sơn, Hà Nội) rồi bay về trời.'],
 ['hv','Sơn Tinh, người cưới được Mị Nương, là thần của ngọn núi nào?',['Tản Viên','Nghĩa Lĩnh','Yên Tử','Ngự Bình'],'Sơn Tinh là thần núi Tản Viên (Ba Vì), dâng lễ vật sớm nên rước được Mị Nương.'],
 ['hv','Lễ vật Vua Hùng thách cưới gồm voi chín ngà, gà chín cựa và ngựa chín gì?',['Hồng mao','Sừng','Móng','Đuôi'],'"Voi chín ngà, gà chín cựa, ngựa chín hồng mao" là lễ vật thách cưới Mị Nương.'],
 ['hv','Lang Liêu dâng lễ vật gì để được Vua Hùng truyền ngôi?',['Bánh chưng, bánh giầy','Voi chín ngà','Ngọc trai biển','Dưa hấu'],'Bánh chưng tượng trưng cho đất, bánh giầy tượng trưng cho trời.'],
 ['hv','Hiện vật tiêu biểu nhất của văn hóa Đông Sơn thời Văn Lang – Âu Lạc là gì?',['Trống đồng','Chuông chùa','Gốm men lam','Tiền đồng'],'Trống đồng như trống Ngọc Lũ là đỉnh cao đúc đồng của cư dân Đông Sơn.'],
 ['hv','Đền Hùng, nơi giỗ Tổ ngày 10 tháng 3 âm lịch, nằm trên núi nào?',['Núi Nghĩa Lĩnh','Núi Sóc','Núi Tản Viên','Núi Nưa'],'Đền Hùng ở núi Nghĩa Lĩnh, Phú Thọ, thờ các Vua Hùng.'],
 ['hv','Mai An Tiêm bị đày ra đảo hoang và tìm ra loại quả nào?',['Dưa hấu','Vải thiều','Bưởi','Xoài'],'Mai An Tiêm gieo hạt chim thả xuống, trồng được dưa hấu rồi thả trôi về đất liền.'],
 ['hv','Thời Hùng Vương, những người giúp vua cai quản đất nước được gọi là gì?',['Lạc hầu, Lạc tướng','Thái úy, Tể tướng','Tiết độ sứ','Thứ sử'],'Lạc hầu giúp việc triều chính, Lạc tướng đứng đầu các bộ của nước Văn Lang.'],
 ['adv','Ai là người lập ra nước Âu Lạc?',['Thục Phán','Triệu Đà','Lý Bí','Ngô Quyền'],'Thục Phán hợp nhất Âu Việt và Lạc Việt, xưng An Dương Vương.'],
 ['adv','Kinh đô của nước Âu Lạc là đâu?',['Cổ Loa','Phong Châu','Mê Linh','Luy Lâu'],'An Dương Vương đóng đô ở Cổ Loa, nay thuộc Hà Nội.'],
 ['adv','Thành Cổ Loa có hình dáng đặc biệt nào?',['Xoắn như vỏ ốc','Hình vuông','Hình tròn một vòng','Hình bát giác'],'Cổ Loa gồm nhiều vòng thành uốn lượn như vỏ ốc, nên còn gọi là Loa Thành.'],
 ['adv','Theo truyền thuyết, vị thần nào giúp An Dương Vương xây thành Cổ Loa?',['Thần Kim Quy','Thần Tản Viên','Thần Thủy Tề','Thần Đồng Cổ'],'Rùa vàng Kim Quy giúp vua trừ yêu quái để thành xây xong.'],
 ['adv','Vũ khí giúp Âu Lạc đánh lui quân Triệu Đà là gì?',['Nỏ thần','Gươm thần','Trống đồng','Voi chiến'],'Nỏ thần lắp lẫy làm bằng móng rùa vàng bắn một phát trúng nhiều tên.'],
 ['adv','Theo truyền thuyết, ai là người chế tạo nỏ cho An Dương Vương?',['Cao Lỗ','Trọng Thủy','Lữ Gia','Thi Sách'],'Tướng Cao Lỗ được dân gian tôn là người chế ra nỏ Liên Châu.'],
 ['adv','Ai đã đánh tráo lẫy nỏ thần khiến Âu Lạc mất nước?',['Trọng Thủy','Triệu Đà','Mị Châu','Cao Lỗ'],'Trọng Thủy, con Triệu Đà, ở rể Cổ Loa và lấy trộm lẫy nỏ.'],
 ['adv','Theo sử truyền thống, nước Âu Lạc rơi vào tay Triệu Đà năm nào?',['179 TCN','208 TCN','111 TCN','40'],'Năm 179 TCN Triệu Đà chiếm Âu Lạc, mở đầu thời Bắc thuộc.'],
 ['adv','Mị Châu rắc gì dọc đường để Trọng Thủy lần theo?',['Lông ngỗng','Hạt gạo','Cánh hoa','Tro bếp'],'Mị Châu rứt lông ngỗng từ áo rắc dọc đường chạy.'],
 ['hbt','Hai Bà Trưng dựng cờ khởi nghĩa vào năm nào?',['Năm 40','Năm 248','Năm 544','Năm 938'],'Mùa xuân năm 40, Hai Bà phất cờ ở Hát Môn.'],
 ['hbt','Khởi nghĩa Hai Bà Trưng chống ách đô hộ của triều đại nào?',['Nhà Đông Hán','Nhà Đường','Nhà Tống','Nhà Lương'],'Thái thú Tô Định của nhà Đông Hán cai trị tàn bạo ở Giao Chỉ.'],
 ['hbt','Viên thái thú bị Hai Bà Trưng đánh đuổi về nước là ai?',['Tô Định','Mã Viện','Lưu Hoằng Tháo','Liễu Thăng'],'Tô Định phải cắt tóc, cạo râu, bỏ ấn tín trốn về Nam Hải.'],
 ['hbt','Sau khi thắng lợi, Trưng Trắc xưng vương và đóng đô ở đâu?',['Mê Linh','Cổ Loa','Luy Lâu','Hoa Lư'],'Trưng Vương đóng đô ở Mê Linh, quê hương của Hai Bà.'],
 ['hbt','Chồng của Trưng Trắc, người bị Tô Định giết hại, là ai?',['Thi Sách','Cao Lỗ','Lý Bí','Đinh Công Trứ'],'Thi Sách là Lạc tướng Chu Diên, bị Tô Định sát hại.'],
 ['hbt','Tướng nhà Hán được cử sang đàn áp khởi nghĩa Hai Bà Trưng là ai?',['Mã Viện','Tô Định','Triệu Đà','Thoát Hoan'],'Năm 42, Mã Viện dẫn quân sang; Hai Bà chống cự quyết liệt.'],
 ['hbt','Hai Bà Trưng hy sinh ở dòng sông nào theo truyền thuyết?',['Sông Hát','Sông Bạch Đằng','Sông Cầu','Sông Tiền'],'Năm 43, Hai Bà gieo mình xuống sông Hát (Hát Giang) chứ không chịu khuất phục.'],
 ['hbt','Nữ tướng nào của Hai Bà Trưng gắn với vùng đất Hải Phòng ngày nay?',['Lê Chân','Bùi Thị Xuân','Triệu Thị Trinh','Dương Vân Nga'],'Lê Chân lập trang An Biên, được xem là người mở đất Hải Phòng.'],
 ['hbt','Hai Bà Trưng giữ nền tự chủ trong khoảng bao lâu?',['3 năm','10 năm','1 năm','30 năm'],'Từ năm 40 đến năm 43, Trưng Vương cai quản đất nước.'],
 ['vx','Bà Triệu (Triệu Thị Trinh) khởi nghĩa vào năm nào?',['Năm 248','Năm 40','Năm 544','Năm 722'],'Năm 248 Bà Triệu dấy binh ở Cửu Chân (Thanh Hóa).'],
 ['vx','Bà Triệu khởi nghĩa chống ách đô hộ của nước nào?',['Nhà Ngô (Đông Ngô)','Nhà Hán','Nhà Lương','Nhà Minh'],'Thời Tam Quốc, Giao Châu thuộc nước Ngô của Tôn Quyền.'],
 ['vx','"Tôi muốn cưỡi cơn gió mạnh, đạp luồng sóng dữ, chém cá kình ở biển Đông..." là câu nói của ai?',['Bà Triệu','Trưng Trắc','Lê Chân','Bùi Thị Xuân'],'Câu nói thể hiện chí khí không chịu làm tì thiếp cho người của Bà Triệu.'],
 ['vx','Bà Triệu dựng căn cứ khởi nghĩa ở ngọn núi nào?',['Núi Nưa','Núi Sóc','Núi Yên Tử','Núi Tản Viên'],'Núi Nưa ở Thanh Hóa là nơi Bà Triệu tập hợp nghĩa quân.'],
 ['vx','Lý Bí lên ngôi, lập nước Vạn Xuân vào năm nào?',['Năm 544','Năm 248','Năm 938','Năm 1010'],'Đầu năm 544 Lý Bí xưng đế, đặt quốc hiệu Vạn Xuân.'],
 ['vx','Lý Bí xưng hiệu là gì?',['Lý Nam Đế','Lý Thái Tổ','Lý Nhân Tông','Dạ Trạch Vương'],'Lý Bí xưng Nam Việt Đế, sử gọi là Lý Nam Đế.'],
 ['vx','Khởi nghĩa Lý Bí chống ách đô hộ của triều đại nào?',['Nhà Lương','Nhà Đường','Nhà Hán','Nhà Ngô'],'Thứ sử Tiêu Tư của nhà Lương bị đánh đuổi năm 542.'],
 ['vx','Ai đánh quân Lương từ đầm Dạ Trạch và được gọi là Dạ Trạch Vương?',['Triệu Quang Phục','Lý Phật Tử','Phùng Hưng','Mai Thúc Loan'],'Triệu Quang Phục đánh du kích từ đầm lầy Dạ Trạch rồi lên ngôi Triệu Việt Vương.'],
 ['vx','Chùa Khai Quốc do Lý Nam Đế dựng là tiền thân của ngôi chùa nào?',['Chùa Trấn Quốc','Chùa Một Cột','Chùa Hương','Chùa Bái Đính'],'Chùa Trấn Quốc bên Hồ Tây là một trong những ngôi chùa cổ nhất Hà Nội.'],
 ['nq','Ngô Quyền đánh tan quân Nam Hán trên sông Bạch Đằng vào năm nào?',['Năm 938','Năm 981','Năm 1077','Năm 1288'],'Chiến thắng Bạch Đằng năm 938 là mốc mở ra thời kỳ độc lập.'],
 ['nq','Năm 938, Ngô Quyền đánh bại đội quân xâm lược nào?',['Nam Hán','Nam Tống','Nguyên Mông','Nhà Minh'],'Vua Nam Hán sai con là Lưu Hoằng Tháo đem thủy quân sang.'],
 ['nq','Thái tử Nam Hán tử trận ở Bạch Đằng năm 938 là ai?',['Lưu Hoằng Tháo','Lưu Cung','Ô Mã Nhi','Hầu Nhân Bảo'],'Lưu Hoằng Tháo bỏ mạng khi thuyền vướng cọc lúc nước rút.'],
 ['nq','Mưu kế nổi tiếng của Ngô Quyền trên sông Bạch Đằng là gì?',['Cắm cọc nhọn bịt sắt, lợi dụng thủy triều','Đắp đê chặn sông','Phóng hỏa đốt kho lương','Đào hào quanh thành'],'Nước lên dụ thuyền giặc vào, nước rút thuyền mắc cọc mà vỡ.'],
 ['nq','Ngô Quyền tiêu diệt ai để trả thù cho Dương Đình Nghệ?',['Kiều Công Tiễn','Đỗ Cảnh Thạc','Tô Định','Lê Chiêu Thống'],'Kiều Công Tiễn giết Dương Đình Nghệ rồi cầu cứu Nam Hán.'],
 ['nq','Sau chiến thắng Bạch Đằng, Ngô Quyền xưng vương và đóng đô ở đâu?',['Cổ Loa','Hoa Lư','Thăng Long','Phú Xuân'],'Năm 939 Ngô Quyền xưng vương, chọn lại Cổ Loa làm kinh đô.'],
 ['nq','Chiến thắng Bạch Đằng năm 938 có ý nghĩa lớn nhất là gì?',['Chấm dứt hơn nghìn năm Bắc thuộc','Dời đô về Thăng Long','Thống nhất mười hai sứ quân','Đánh tan quân Xiêm'],'Từ đây nước ta bước vào thời kỳ độc lập lâu dài.'],
 ['nq','Dương Đình Nghệ có quan hệ thế nào với Ngô Quyền?',['Cha vợ','Anh ruột','Thầy dạy võ','Con trai'],'Ngô Quyền là con rể của Dương Đình Nghệ.'],
 ['dinh','Ai là người dẹp loạn mười hai sứ quân?',['Đinh Bộ Lĩnh','Lê Hoàn','Ngô Xương Văn','Lý Công Uẩn'],'Đinh Bộ Lĩnh được tôn là Vạn Thắng Vương sau khi dẹp xong các sứ quân.'],
 ['dinh','Năm 968, Đinh Bộ Lĩnh lên ngôi và đặt quốc hiệu là gì?',['Đại Cồ Việt','Đại Việt','Đại Ngu','Vạn Xuân'],'Quốc hiệu Đại Cồ Việt dùng từ năm 968 đến năm 1054.'],
 ['dinh','Kinh đô của nhà Đinh đặt ở đâu?',['Hoa Lư','Cổ Loa','Thăng Long','Tây Đô'],'Hoa Lư có núi đá vôi bao bọc như một tòa thành tự nhiên.'],
 ['dinh','Thuở nhỏ chăn trâu, Đinh Bộ Lĩnh cùng bạn lấy gì làm cờ tập trận?',['Bông lau','Lá chuối','Cành tre','Khăn đỏ'],'Tích "cờ lau tập trận" ở vùng Hoa Lư.'],
 ['dinh','Năm 970, Đinh Tiên Hoàng đặt niên hiệu là gì?',['Thái Bình','Thiên Phúc','Thuận Thiên','Quang Trung'],'Niên hiệu Thái Bình thể hiện ước vọng đất nước yên bình sau loạn sứ quân.'],
 ['dinh','Ai là người lập ra nhà Tiền Lê?',['Lê Hoàn','Lê Lợi','Lê Lai','Lê Long Đĩnh'],'Năm 980 Lê Hoàn lên ngôi, sử gọi là Lê Đại Hành.'],
 ['dinh','Lê Hoàn đánh bại cuộc xâm lược của nhà Tống vào năm nào?',['Năm 981','Năm 938','Năm 1077','Năm 1285'],'Năm 981 quân Tống thua ở Bạch Đằng và Chi Lăng, tướng Hầu Nhân Bảo bị giết.'],
 ['dinh','Thái hậu Dương Vân Nga, người trao áo long cổn cho Lê Hoàn, là vợ của vua nào?',['Đinh Tiên Hoàng','Ngô Quyền','Lý Thái Tổ','Trần Thái Tông'],'Vì vận nước, Dương Vân Nga trao ngôi cho Thập đạo tướng quân Lê Hoàn.'],
 ['dinh','Vị vua nào lần đầu tổ chức lễ cày ruộng tịch điền ở nước ta?',['Lê Đại Hành','Lý Thái Tổ','Đinh Tiên Hoàng','Trần Nhân Tông'],'Năm 987 Lê Đại Hành xuống cày ở núi Đọi để khuyến khích nghề nông.'],
 ['ly','Năm 1010, Lý Công Uẩn dời đô từ Hoa Lư về thành Đại La và đổi tên là gì?',['Thăng Long','Đông Đô','Tây Đô','Phú Xuân'],'Tương truyền vua thấy rồng vàng bay lên nên đặt tên Thăng Long.'],
 ['ly','Văn bản Lý Công Uẩn ban ra khi quyết định dời đô gọi là gì?',['Chiếu dời đô','Hịch tướng sĩ','Bình Ngô đại cáo','Nam quốc sơn hà'],'Chiếu dời đô (Thiên đô chiếu) nêu Đại La là nơi "trung tâm trời đất".'],
 ['ly','Nhà Lý đổi quốc hiệu thành Đại Việt vào năm nào?',['Năm 1054','Năm 1010','Năm 968','Năm 1428'],'Năm 1054 vua Lý Thánh Tông đổi tên nước là Đại Việt.'],
 ['ly','Văn Miếu ở Thăng Long được xây dựng năm nào?',['Năm 1070','Năm 1010','Năm 1076','Năm 1226'],'Năm 1070 vua Lý Thánh Tông cho lập Văn Miếu thờ Khổng Tử.'],
 ['ly','Quốc Tử Giám, được xem là trường đại học đầu tiên của nước ta, lập năm nào?',['Năm 1076','Năm 1070','Năm 1075','Năm 1010'],'Năm 1076 nhà Lý lập Quốc Tử Giám bên cạnh Văn Miếu.'],
 ['ly','Khoa thi Nho học đầu tiên của nước ta được mở năm nào?',['Năm 1075','Năm 1076','Năm 1070','Năm 1054'],'Khoa thi Minh kinh bác học năm 1075, Lê Văn Thịnh đỗ đầu.'],
 ['ly','Năm 1077, Lý Thường Kiệt chặn quân Tống ở phòng tuyến trên sông nào?',['Sông Như Nguyệt','Sông Bạch Đằng','Sông Hát','Sông Gianh'],'Phòng tuyến Như Nguyệt dọc sông Cầu chặn đứng quân Quách Quỳ.'],
 ['ly','Bài thơ thường được gọi là bản tuyên ngôn độc lập đầu tiên, gắn với trận Như Nguyệt, là bài nào?',['Nam quốc sơn hà','Hịch tướng sĩ','Bình Ngô đại cáo','Tụng giá hoàn kinh sư'],'Bài thơ khẳng định "sông núi nước Nam vua Nam ở".'],
 ['ly','"Nam quốc sơn hà Nam đế cư" – câu tiếp theo là gì?',['Tiệt nhiên định phận tại thiên thư','Như hà nghịch lỗ lai xâm phạm','Nhữ đẳng hành khan thủ bại hư','Thái bình tu trí lực'],'Câu thứ hai: phận định rõ ràng ở sách trời.'],
 ['ly','Năm 1075, Lý Thường Kiệt chủ động đem quân đánh thành nào của nhà Tống?',['Ung Châu','Quảng Châu','Biện Kinh','Hàng Châu'],'Quân Lý hạ thành Ung Châu, phá nơi quân Tống tập kết.'],
 ['ly','Chiến lược của Lý Thường Kiệt khi đánh sang đất Tống được tóm lại bằng câu nào?',['Tiên phát chế nhân','Vườn không nhà trống','Lấy đoản binh chế trường trận','Dĩ bất biến ứng vạn biến'],'"Ngồi yên đợi giặc không bằng đem quân ra trước để chặn mũi nhọn của giặc".'],
 ['ly','Chùa Một Cột (Diên Hựu) được xây dưới triều vua nào?',['Lý Thái Tông','Lý Thái Tổ','Trần Nhân Tông','Lê Thánh Tông'],'Năm 1049 vua Lý Thái Tông cho dựng chùa theo giấc mộng gặp Quan Âm.'],
 ['ly','Vị nữ hoàng duy nhất trong lịch sử Việt Nam là ai?',['Lý Chiêu Hoàng','Dương Vân Nga','Trưng Trắc','Ỷ Lan'],'Lý Chiêu Hoàng nhường ngôi cho chồng là Trần Cảnh, mở ra nhà Trần.'],
 ['tran','Vị vua đầu tiên của nhà Trần là ai?',['Trần Thái Tông','Trần Nhân Tông','Trần Thánh Tông','Trần Hưng Đạo'],'Trần Cảnh nhận ngôi từ Lý Chiêu Hoàng, miếu hiệu Trần Thái Tông.'],
 ['tran','Nhà Trần đã mấy lần đánh thắng quân Mông – Nguyên?',['3 lần','2 lần','4 lần','1 lần'],'Ba lần thắng vào các năm 1258, 1285 và 1288.'],
 ['tran','Cuộc kháng chiến chống quân Mông Cổ lần thứ nhất diễn ra năm nào?',['Năm 1258','Năm 1285','Năm 1288','Năm 1226'],'Đầu năm 1258 quân Mông Cổ phải rút về sau trận Đông Bộ Đầu.'],
 ['tran','"Đầu thần chưa rơi xuống đất, xin bệ hạ đừng lo" là câu nói của ai?',['Trần Thủ Độ','Trần Hưng Đạo','Trần Quang Khải','Trần Bình Trọng'],'Thái sư Trần Thủ Độ trấn an vua Trần Thái Tông năm 1258.'],
 ['tran','Hội nghị nào hỏi ý các bô lão cả nước "nên hòa hay nên đánh"?',['Hội nghị Diên Hồng','Hội nghị Bình Than','Hội thề Lũng Nhai','Hội thề Đông Quan'],'Các bô lão đồng thanh hô "Đánh!" ở điện Diên Hồng.'],
 ['tran','"Hịch tướng sĩ" do ai soạn?',['Trần Hưng Đạo','Trần Thủ Độ','Nguyễn Trãi','Lý Thường Kiệt'],'Trần Quốc Tuấn viết hịch khích lệ tướng sĩ trước cuộc kháng chiến lần hai.'],
 ['tran','Câu "Ta thường tới bữa quên ăn, nửa đêm vỗ gối..." nằm trong tác phẩm nào?',['Hịch tướng sĩ','Bình Ngô đại cáo','Chiếu dời đô','Nam quốc sơn hà'],'Đoạn văn bày tỏ nỗi lòng của Trần Hưng Đạo trước họa xâm lăng.'],
 ['tran','Không được dự bàn việc nước, Trần Quốc Toản tức giận bóp nát thứ gì?',['Quả cam','Chén ngọc','Thanh kiếm','Lá cờ'],'Vua ban quả cam, Hoài Văn hầu bóp nát lúc nào không hay.'],
 ['tran','Lá cờ của Trần Quốc Toản thêu sáu chữ vàng nào?',['Phá cường địch, báo hoàng ân','Sát Thát','Nam quốc sơn hà','Thuận thiên hành đạo'],'Hoài Văn hầu tự lập đội quân riêng với lá cờ ấy.'],
 ['tran','Quân sĩ nhà Trần thích lên cánh tay hai chữ gì?',['Sát Thát','Trung quân','Phá Tống','Đại Việt'],'"Sát Thát" nghĩa là giết giặc Thát Đát (Mông Cổ).'],
 ['tran','Trận Bạch Đằng năm 1288 bắt sống tướng giặc nào?',['Ô Mã Nhi','Thoát Hoan','Toa Đô','Liễu Thăng'],'Đô đốc Ô Mã Nhi bị bắt khi thuyền chiến mắc cọc.'],
 ['tran','Theo sử cũ, Thoát Hoan phải chui vào vật gì để trốn về nước?',['Ống đồng','Chum nước','Thùng gỗ','Bao gạo'],'Thoát Hoan nấp trong ống đồng cho quân lính khiêng chạy.'],
 ['tran','Trong kháng chiến chống Nguyên, Trần Quốc Tuấn giữ chức chỉ huy tối cao nào?',['Quốc công Tiết chế','Thái sư','Thượng tướng thái sư','Đô đốc thủy quân'],'Quốc công Tiết chế thống lĩnh toàn bộ quân đội.'],
 ['tran','Thiền phái Trúc Lâm Yên Tử do vị vua nào sáng lập?',['Trần Nhân Tông','Trần Thái Tông','Lý Thái Tông','Lê Thánh Tông'],'Sau khi nhường ngôi, Trần Nhân Tông lên Yên Tử tu hành.'],
 ['tran','"Chương Dương cướp giáo giặc, Hàm Tử bắt quân thù" là thơ của ai?',['Trần Quang Khải','Trần Hưng Đạo','Phạm Ngũ Lão','Trần Nhân Tông'],'Thượng tướng Trần Quang Khải viết bài "Tụng giá hoàn kinh sư".'],
 ['tran','"Ta thà làm quỷ nước Nam chứ không thèm làm vương đất Bắc" là lời của ai?',['Trần Bình Trọng','Trần Quốc Toản','Trần Thủ Độ','Phạm Ngũ Lão'],'Trần Bình Trọng bị bắt năm 1285 vẫn khẳng khái chối từ.'],
 ['ho','Hồ Quý Ly lập ra nhà Hồ vào năm nào?',['Năm 1400','Năm 1407','Năm 1428','Năm 1388'],'Năm 1400 Hồ Quý Ly phế vua Trần, lên ngôi.'],
 ['ho','Quốc hiệu của nước ta thời nhà Hồ là gì?',['Đại Ngu','Đại Việt','Đại Cồ Việt','Đại Nam'],'Đại Ngu có nghĩa là "sự yên vui lớn".'],
 ['ho','Nhà Hồ phát hành tiền giấy có tên là gì?',['Thông bảo hội sao','Thái Bình hưng bảo','Quang Trung thông bảo','Thuận Thiên nguyên bảo'],'Tiền giấy Thông bảo hội sao in hình rong, sóng, mây, rùa, lân, phượng, rồng.'],
 ['ho','Thành nhà Hồ (Tây Đô), di sản thế giới, nằm ở tỉnh nào?',['Thanh Hóa','Ninh Bình','Nghệ An','Hà Nội'],'Thành xây bằng những khối đá lớn, được UNESCO công nhận năm 2011.'],
 ['ho','Nhà Hồ thất bại trước cuộc xâm lược của quân nào?',['Nhà Minh','Nhà Nguyên','Nhà Thanh','Nhà Tống'],'Quân Minh sang xâm lược, cha con Hồ Quý Ly bị bắt năm 1407.'],
 ['ls','Lê Lợi dựng cờ khởi nghĩa ở đâu?',['Lam Sơn','Lũng Nhai','Chí Linh','Hoa Lư'],'Khởi nghĩa Lam Sơn bùng nổ ở vùng núi Thanh Hóa.'],
 ['ls','Khởi nghĩa Lam Sơn bắt đầu vào năm nào?',['Năm 1418','Năm 1407','Năm 1427','Năm 1400'],'Đầu năm 1418 Lê Lợi xưng Bình Định Vương.'],
 ['ls','Ai đã đóng giả Lê Lợi, liều mình cứu chủ tướng?',['Lê Lai','Nguyễn Trãi','Lê Sát','Đinh Lễ'],'Lê Lai mặc áo bào, phá vây thu hút quân Minh và hy sinh.'],
 ['ls','Tác giả của "Bình Ngô đại cáo" là ai?',['Nguyễn Trãi','Lê Lợi','Lý Thường Kiệt','Trần Hưng Đạo'],'Nguyễn Trãi thay Lê Lợi viết bản cáo năm 1428.'],
 ['ls','Câu "Việc nhân nghĩa cốt ở yên dân" mở đầu tác phẩm nào?',['Bình Ngô đại cáo','Hịch tướng sĩ','Chiếu dời đô','Quân trung từ mệnh tập'],'Tư tưởng nhân nghĩa là cốt lõi của Bình Ngô đại cáo.'],
 ['ls','Tướng Minh bị chém đầu ở ải Chi Lăng năm 1427 là ai?',['Liễu Thăng','Vương Thông','Mộc Thạnh','Trương Phụ'],'Liễu Thăng sa vào trận phục kích ở Chi Lăng – Xương Giang.'],
 ['ls','Theo truyền thuyết, Lê Lợi trả gươm thần cho Rùa Vàng ở hồ nào?',['Hồ Hoàn Kiếm','Hồ Tây','Hồ Ba Bể','Hồ Trúc Bạch'],'Hồ Lục Thủy từ đó được gọi là hồ Hoàn Kiếm.'],
 ['ls','Năm 1428, Lê Lợi lên ngôi, miếu hiệu là gì?',['Lê Thái Tổ','Lê Thánh Tông','Lê Đại Hành','Lê Thái Tông'],'Lê Thái Tổ mở ra nhà Hậu Lê, đặt lại quốc hiệu Đại Việt.'],
 ['ls','Trận Tốt Động – Chúc Động năm 1426 đánh tan đạo quân Minh do ai chỉ huy?',['Vương Thông','Liễu Thăng','Tôn Sĩ Nghị','Thoát Hoan'],'Vương Thông thua to rồi rút vào cố thủ thành Đông Quan.'],
 ['ls','Theo truyền thuyết, kiến ăn mỡ trên lá cây thành dòng chữ nào?',['Lê Lợi vi quân, Nguyễn Trãi vi thần','Thuận thiên hành đạo','Sát Thát','Nam quốc sơn hà'],'Nguyễn Trãi dùng mỡ viết chữ để thu phục lòng người theo Lê Lợi.'],
 ['ts','Ai KHÔNG thuộc ba anh em Tây Sơn?',['Nguyễn Ánh','Nguyễn Nhạc','Nguyễn Huệ','Nguyễn Lữ'],'Nguyễn Ánh là đối thủ của Tây Sơn, sau lập nhà Nguyễn.'],
 ['ts','Khởi nghĩa Tây Sơn bùng nổ vào năm nào?',['Năm 1771','Năm 1785','Năm 1789','Năm 1418'],'Năm 1771 ba anh em dựng cờ ở ấp Tây Sơn.'],
 ['ts','Trận Rạch Gầm – Xoài Mút năm 1785 đánh tan quân xâm lược nào?',['Quân Xiêm','Quân Thanh','Quân Minh','Quân Nguyên'],'Nguyễn Huệ phục kích tiêu diệt gần như toàn bộ quân Xiêm.'],
 ['ts','Trận Rạch Gầm – Xoài Mút diễn ra trên dòng sông nào?',['Sông Tiền','Sông Hồng','Sông Cầu','Sông Đà'],'Đoạn sông Tiền này là nơi đặt trận địa mai phục.'],
 ['ts','Năm 1788, Nguyễn Huệ lên ngôi hoàng đế với niên hiệu gì?',['Quang Trung','Thái Đức','Cảnh Thịnh','Gia Long'],'Nguyễn Huệ lên ngôi rồi lập tức tiến quân ra Bắc.'],
 ['ts','Tết Kỷ Dậu 1789, vua Quang Trung đại phá quân xâm lược nào?',['Quân Thanh','Quân Xiêm','Quân Minh','Quân Nam Hán'],'Hai mươi chín vạn quân Thanh tan vỡ chỉ trong mấy ngày Tết.'],
 ['ts','Tướng Thanh thắt cổ tự tử ở Đống Đa là ai?',['Sầm Nghi Đống','Tôn Sĩ Nghị','Hứa Thế Hanh','Liễu Thăng'],'Sầm Nghi Đống giữ đồn Khương Thượng, thua trận bèn tự vẫn.'],
 ['ts','Tổng đốc Lưỡng Quảng chỉ huy quân Thanh, bỏ cả ấn tín chạy về nước, là ai?',['Tôn Sĩ Nghị','Sầm Nghi Đống','Mã Viện','Vương Thông'],'Tôn Sĩ Nghị hoảng sợ chạy qua cầu phao sông Hồng.'],
 ['ts','Vị vua nào đã cầu cứu nhà Thanh, rước quân Thanh vào nước ta?',['Lê Chiêu Thống','Lê Thánh Tông','Lê Thái Tổ','Lê Hiển Tông'],'Lê Chiêu Thống sau phải chạy theo quân Thanh sang Trung Quốc.'],
 ['ts','Rạng sáng mùng 5 Tết Kỷ Dậu, quân Tây Sơn dùng ván ghép bọc rơm ướt hạ đồn nào?',['Đồn Ngọc Hồi','Đồn Hà Hồi','Đồn Khương Thượng','Thành Đông Quan'],'Đội quân khiêng ván ghép tiến lên, đồn Ngọc Hồi vỡ tan.'],
 ['ts','Nữ tướng Tây Sơn nổi tiếng chỉ huy đội tượng binh là ai?',['Bùi Thị Xuân','Lê Chân','Triệu Thị Trinh','Lê Ngọc Hân'],'Đô đốc Bùi Thị Xuân có tài luyện voi chiến.'],
 ['ts','Vua Quang Trung đề cao loại chữ nào trong văn bản nhà nước?',['Chữ Nôm','Chữ Quốc ngữ','Chữ Phạn','Chữ Chăm'],'Quang Trung khuyến khích dùng chữ Nôm, chữ viết ghi tiếng Việt.'],
 ['ts','Vua Quang Trung mất vào năm nào?',['Năm 1792','Năm 1789','Năm 1802','Năm 1788'],'Quang Trung đột ngột qua đời năm 1792, khi nhiều cải cách còn dang dở.'],
 ['ly','Theo Chiếu dời đô, Lý Công Uẩn dời đô từ đâu ra Đại La?',['Hoa Lư','Cổ Loa','Mê Linh','Phong Châu'],'Hoa Lư chật hẹp, không thuận để mở mang nên vua dời đô.'],
 ['tran','Vị tướng nào "ngồi đan sọt mà lo việc nước", được Trần Hưng Đạo tiến cử?',['Phạm Ngũ Lão','Trần Khánh Dư','Yết Kiêu','Dã Tượng'],'Phạm Ngũ Lão mải nghĩ binh pháp, bị lính đâm giáo vào đùi vẫn không hay.'],
 ['adv','Nước Âu Lạc được hình thành từ sự hợp nhất của người Lạc Việt với cư dân nào?',['Âu Việt','Chăm Pa','Phù Nam','Nam Hán'],'Tên Âu Lạc ghép từ Âu Việt và Lạc Việt.'],
];
/* ================= BIA ĐÁ: hai tấm mỗi chương, câu hỏi gắn với vùng đất ================= */
const BIA=[
 [['Ngã Ba Bạch Hạc','Nơi các dòng sông lớn hợp lại trước Phong Châu. Làng chài ven sông vẫn kể chuyện cá anh vũ môi dày như mỏ vẹt, xưa dùng để tiến vua.','Cá anh vũ, sản vật tiến vua nổi tiếng, gắn với ngã ba sông nào?',['Bạch Hạc','Bạch Đằng','Như Nguyệt','Rạch Gầm'],'Ngã ba Bạch Hạc ở Việt Trì là quê của cá anh vũ.'],
  ['Núi Nghĩa Lĩnh','Trên đỉnh núi, con cháu dựng đền thờ các Vua Hùng. "Dù ai đi ngược về xuôi, nhớ ngày giỗ Tổ mùng mười tháng ba".','Giỗ Tổ Hùng Vương vào ngày nào âm lịch?',['10 tháng 3','15 tháng 8','5 tháng 5','23 tháng Chạp'],'Ngày 10 tháng 3 âm lịch là Quốc giỗ, tưởng nhớ các Vua Hùng.']],
 [['Loa Thành','Lũy đất đắp vòng vèo như vỏ ốc, có hào nước nối với sông. Khảo cổ tìm thấy ở đây hàng vạn mũi tên đồng.','Thành Cổ Loa nay thuộc thành phố nào?',['Hà Nội','Hải Phòng','Bắc Ninh','Huế'],'Di tích Cổ Loa nằm ở ngoại thành phía bắc Hà Nội.'],
  ['Giếng Ngọc','Dân gian kể Trọng Thủy nhảy xuống giếng trong thành vì thương nhớ Mị Châu. Ngọc trai rửa nước giếng này thì sáng hơn.','Theo truyền thuyết, máu Mị Châu chảy xuống biển hóa thành gì?',['Ngọc trai','San hô','Rong biển','Cá vàng'],'Trai sò ăn phải máu Mị Châu đều hóa ngọc.']],
 [['Hát Môn','Nơi Hai Bà Trưng tế cờ khởi nghĩa, và cũng là nơi Hai Bà gieo mình xuống dòng sông Hát khi thế cùng.','Hai Bà Trưng hy sinh vào năm nào?',['Năm 43','Năm 40','Năm 248','Năm 544'],'Sau ba năm giữ nước, Hai Bà hy sinh năm 43.'],
  ['Luy Lâu','Trị sở quận Giao Chỉ thời Bắc thuộc, cũng là trung tâm Phật giáo sớm nhất của nước ta.','Thành cổ Luy Lâu nằm ở tỉnh nào?',['Bắc Ninh','Thanh Hóa','Ninh Bình','Phú Thọ'],'Luy Lâu ở Thuận Thành, Bắc Ninh.']],
 [['Đầm Dạ Trạch','Đầm lầy lau sậy mênh mông, Triệu Quang Phục ngày ẩn đêm ra đánh khiến quân Lương mỏi mệt.','Đầm Dạ Trạch thuộc vùng đất tỉnh nào ngày nay?',['Hưng Yên','Thanh Hóa','Lạng Sơn','Quảng Ninh'],'Dạ Trạch ở Khoái Châu, Hưng Yên.'],
  ['Núi Nưa','Rừng núi Cửu Chân là căn cứ của người con gái cưỡi voi trắng, mặc áo giáp vàng ra trận.','Bà Triệu tên thật là gì?',['Triệu Thị Trinh','Triệu Thị Nưa','Trưng Nhị','Lê Thị Chân'],'Triệu Thị Trinh, dân gian gọi là Bà Triệu.']],
 [['Bãi Cọc','Cọc lim đầu bịt sắt cắm dày dưới lòng sông, chỉ lộ ra khi nước triều rút.','Ngô Quyền tận dụng yếu tố tự nhiên nào để thắng trận Bạch Đằng?',['Thủy triều','Gió mùa','Lũ lụt','Sương mù'],'Thủy triều lên xuống quyết định thời điểm thuyền giặc mắc cọc.'],
  ['Đường Lâm','Làng cổ đá ong được gọi là "đất hai vua", quê của Phùng Hưng và Ngô Quyền.','Ngoài Ngô Quyền, vị vua nào cũng sinh ra ở Đường Lâm?',['Phùng Hưng','Lý Bí','Đinh Bộ Lĩnh','Lê Hoàn'],'Bố Cái Đại Vương Phùng Hưng khởi nghĩa chống nhà Đường.']],
 [['Cố Đô Hoa Lư','Núi đá vôi dựng thành vách, sông suối làm hào. Đền vua Đinh, vua Lê vẫn đứng giữa thung lũng.','Cố đô Hoa Lư thuộc tỉnh nào?',['Ninh Bình','Thanh Hóa','Hà Nam','Nam Định'],'Hoa Lư là kinh đô của Đại Cồ Việt, ở Ninh Bình.'],
  ['Áo Long Cổn','Năm 980, giặc Tống sắp kéo sang mà vua còn nhỏ, triều đình phải chọn người cầm quân.','Ai đã trao áo long cổn, tôn Lê Hoàn lên ngôi?',['Thái hậu Dương Vân Nga','Đinh Liễn','Ngô Xương Văn','Lý Công Uẩn'],'Thái hậu Dương Vân Nga đặt vận nước lên trên ngôi báu.']],
 [['Phòng Tuyến Sông Cầu','Lũy tre, cọc gỗ dọc bờ nam, nơi đêm đêm vang bài thơ thần khiến quân Tống khiếp vía.','Sông Như Nguyệt là khúc của dòng sông nào ngày nay?',['Sông Cầu','Sông Hồng','Sông Đuống','Sông Thương'],'Như Nguyệt là đoạn sông Cầu chảy qua Bắc Ninh.'],
  ['Rồng Bay','Lý Công Uẩn rời Hoa Lư ra thành Đại La rộng rãi, bằng phẳng, "muôn vật phong phú tốt tươi".','Tên Thăng Long có nghĩa là gì?',['Rồng bay lên','Rồng ẩn mình','Thành vững chắc','Đất yên bình'],'Tương truyền vua thấy rồng vàng bay lên khi thuyền cập bến.']],
 [['Bến Tây Kết','Giữa năm 1285, quân Trần đánh úp đạo quân từ Chiêm Thành kéo ra ở bãi Tây Kết.','Tướng Nguyên tử trận ở Tây Kết năm 1285 là ai?',['Toa Đô','Ô Mã Nhi','Thoát Hoan','Phàn Tiếp'],'Toa Đô bị chém, đạo quân phía nam của giặc tan rã.'],
  ['Bến Chương Dương','Thủy quân Trần đánh tan đồn giặc ở Chương Dương rồi tiến về giải phóng Thăng Long.','Trận Chương Dương năm 1285 do ai chỉ huy?',['Trần Quang Khải','Trần Bình Trọng','Trần Khánh Dư','Phạm Ngũ Lão'],'Thượng tướng Trần Quang Khải lập công lớn ở Chương Dương.']],
 [['Kiếp Bạc','Đại bản doanh của Hưng Đạo Vương bên sông Lục Đầu. Đền thờ Đức Thánh Trần nay ở đây.','Đền Kiếp Bạc thờ vị anh hùng nào?',['Trần Hưng Đạo','Trần Nhân Tông','Lý Thường Kiệt','Ngô Quyền'],'Đền Kiếp Bạc là nơi thờ chính Hưng Đạo Đại Vương.'],
  ['Cọc Bạch Đằng 1288','Hơn ba thế kỷ sau Ngô Quyền, quân Trần lại đóng cọc trên cửa sông cũ đón đoàn thuyền Ô Mã Nhi.','Trận Bạch Đằng 1288 lặp lại mưu kế của ai?',['Ngô Quyền','Lý Thường Kiệt','Lê Hoàn','Quang Trung'],'Mưu đóng cọc chờ nước rút của Ngô Quyền năm 938 được dùng lại.']],
 [['Ải Chi Lăng','Thung lũng hẹp giữa núi đá, cửa ngõ phía bắc. Nhiều đạo quân xâm lược đã bỏ mạng tại đây.','Ải Chi Lăng nằm ở tỉnh nào?',['Lạng Sơn','Cao Bằng','Quảng Ninh','Thanh Hóa'],'Chi Lăng thuộc Lạng Sơn, trên đường từ biên giới về Thăng Long.'],
  ['Hội Thề Đông Quan','Cuối năm 1427, quân Minh trong thành Đông Quan xin hàng và được cấp thuyền, ngựa về nước.','Sự kiện quân Minh xin hàng năm 1427 được gọi là gì?',['Hội thề Đông Quan','Hội thề Lũng Nhai','Hội nghị Diên Hồng','Hội nghị Bình Than'],'Hội thề Đông Quan kết thúc hai mươi năm Minh thuộc.']],
 [['Rạch Gầm','Hai nhánh rạch đổ ra sông Tiền, cù lao giữa dòng che giấu thuyền chiến Tây Sơn.','Quân Tây Sơn đánh tan quân Xiêm ở Rạch Gầm – Xoài Mút vào năm nào?',['Năm 1785','Năm 1771','Năm 1789','Năm 1802'],'Đầu năm 1785, Nguyễn Huệ chỉ một trận đã đuổi quân Xiêm.'],
  ['Ấp Tây Sơn','Ba anh em họ Hồ đổi sang họ Nguyễn, dựng cờ ở vùng núi phía tây phủ Quy Nhơn.','Ấp Tây Sơn, quê của ba anh em Nguyễn Nhạc, Nguyễn Huệ, Nguyễn Lữ, thuộc phủ nào thời đó?',['Quy Nhơn','Gia Định','Thuận Hóa','Phú Yên'],'Tây Sơn thượng đạo thuộc phủ Quy Nhơn xưa.']],
 [['Gò Đống Đa','Gò đất lớn chôn xác quân Thanh, mỗi năm dân làng mở hội mừng chiến thắng.','Vua Quang Trung tiến vào Thăng Long vào ngày nào Tết Kỷ Dậu?',['Trưa mùng 5','Đêm 30','Mùng 1','Rằm tháng Giêng'],'Trưa mùng 5 Tết, vua vào Thăng Long, áo bào sạm đen khói súng.'],
  ['Đồn Ngọc Hồi','Tấm ván ghép bọc rơm ướt, mười người khiêng một tấm, thẳng tiến dưới làn đạn.','Vua Quang Trung mất năm nào?',['Năm 1792','Năm 1789','Năm 1802','Năm 1786'],'Quang Trung qua đời năm 1792, sự nghiệp còn dang dở.']],
];
/* ================= CÁ ================= */
const RAR=[['Thường','#d8d0bf'],['Khá','#62b4ff'],['Hiếm','#c58bff'],['Quý','#ffc53d'],['Huyền Thoại','#ff5b3d']];
const FISH=[
 {id:'ro',nm:'Cá Rô Đồng',r:0,w:22,kg:[0.05,0.35],p:8,c:['#5a6a3a','#c8c08a','#3a4a2a'],pat:'bars',ds:'Nhỏ mà chắc thịt. Mưa rào đầu mùa, cá rô thường vượt cạn lên ruộng.'},
 {id:'diec',nm:'Cá Diếc',r:0,w:18,kg:[0.1,0.6],p:9,c:['#9aa49a','#e2e4d8','#6a746a'],pat:'scale',ds:'Họ hàng nhỏ của cá chép, sống trong ao hồ khắp đồng bằng.'},
 {id:'tre',nm:'Cá Trê',r:0,w:12,kg:[0.3,2.5],p:12,c:['#3a3430','#8a7a6a','#2a2420'],pat:'cat',ds:'Cá da trơn có râu dài, ưa nằm dưới bùn đáy ao.'},
 {id:'chep',nm:'Cá Chép',r:1,w:14,kg:[0.5,6],p:20,c:['#a8823a','#f0d890','#8a4a2a'],pat:'scale',ds:'Ngày 23 tháng Chạp, người Việt thả cá chép tiễn ông Công ông Táo về trời.'},
 {id:'tram',nm:'Cá Trắm Cỏ',r:1,w:10,kg:[1,12],p:24,c:['#6a7a5a','#d8d8b8','#4a5a3a'],pat:'scale',ds:'Cá ăn cỏ lớn nhanh, nuôi nhiều ở ao làng.'},
 {id:'qua',nm:'Cá Quả',r:1,w:10,kg:[0.5,5],p:22,c:['#4a4a3a','#c8c0a0','#2a2a20'],pat:'blot',ds:'Miền Bắc gọi cá quả, miền Nam gọi cá lóc. Cá dữ, đớp mồi rất mạnh.'},
 {id:'gam',nm:'Cá Chép Gấm',r:1,w:6,kg:[0.5,4],p:30,c:['#f4efe4','#fff8f0','#e04a2a'],pat:'koi',ds:'Cá chép nhiều màu nuôi làm cảnh, chính là đàn cá bơi trong hồ sen giữa thành.'},
 {id:'lang',nm:'Cá Lăng',r:2,w:5,kg:[1,15],p:60,c:['#7a7e86','#d8dae0','#4a4e56'],pat:'cat',ds:'Cá da trơn sông lớn, thịt chắc ít xương, nổi tiếng ở sông Đà, sông Lô.'},
 {id:'anhvu',nm:'Cá Anh Vũ',r:3,w:2.5,kg:[0.5,3],p:160,c:['#5a5040','#c8b898','#3a3020'],pat:'lip',ds:'Sản vật tiến vua vùng ngã ba Bạch Hạc, môi dày như mỏ chim anh vũ.'},
 {id:'rong',nm:'Cá Chép Hóa Rồng',r:4,w:0.5,kg:[8,25],p:600,c:['#ffb03a','#fff0b0','#e0402a'],pat:'dragon',ds:'Truyền thuyết kể cá chép vượt Vũ Môn sẽ hóa rồng. Hiếm vô cùng.'},
];
const FISH_BY={};FISH.forEach(f=>FISH_BY[f.id]=f);
const CASTS=15,QUIZ_N=5,ESC_N=3,ESC_LV=3,KEY_ELITE=0.2;
const BITE_W=[1.0,0.9,0.76,0.64,0.52],ZONE_W=[0.36,0.32,0.27,0.23,0.19],ZONE_S=[0.8,1.0,1.25,1.55,1.9],PROG=[0.36,0.28,0.22,0.17,0.13];

/* ================= TRẠNG THÁI ================= */
const NV={ov:null,E:null,guide:null,manual:false,off:0,hubView:'act',_last:0};
const now=()=>Date.now()+NV.off;
const today=()=>dayKey(new Date(now()));
const Lv=()=>G.save?G.save.lvl:1;
const g0=()=>50*Lv()+200;
function S_(){const S=G.save;if(!S)return null;let s=S.nv;
  if(!s||typeof s!=='object'||Array.isArray(s))s=S.nv={};
  if(!s.v)s.v=1;
  for(const k of ['bia','rec','basket','chest','chestEver','cnt'])if(!s[k]||typeof s[k]!=='object'||Array.isArray(s[k]))s[k]={};
  if(!Array.isArray(s.qseen))s.qseen=[];
  if(typeof s.keys!=='number')s.keys=0;
  const d=today();
  if(s.day!==d){s.day=d;s.qz=0;s.qc=0;s.cast=0;s.esc=0;s.ord=null}
  if(!s.ord)s.ord=genOrder(d);
  return s}
function genOrder(d){const R=mulberry32(d*7+13);const pool=FISH.filter(f=>f.r<=1);const f=pool[Math.floor(R()*pool.length)];return{sp:f.id,n:2+Math.floor(R()*2),done:0}}
function bumpD(k,v){try{if(window.DAILY&&DAILY.bump)DAILY.bump(k,v)}catch(e){console.error(e)}}
function cnt(k,v){const s=S_();if(s)s.cnt[k]=(s.cnt[k]||0)+(v==null?1:v)}
const RWN={gold:'vàng',ore:'Huyền Thiết',cq:'Chân Khí',tq:'Tàn Quyển',charm:'Bùa Bảo Hộ',potHP:'Bình Kim Sang',potMP:'Bình Nội Lực'};
function give(rw,why){const parts=[];for(const k of ['gold','ore','cq','tq','charm','potHP','potMP']){const n=Math.round(rw[k]||0);if(n>0){giveRes(k,n,why||'nv');parts.push('+'+(k==='gold'||k==='cq'?fmt(n):n)+' '+RWN[k])}}
  if(rw.potHP||rw.potMP)G.dirty.pot=1;if(rw.exp&&G.p){gainExp(rw.exp);parts.push('+'+fmt(rw.exp)+' kinh nghiệm')}G.dirty.res=1;return parts.join(', ')}
function chips(rw){const o=[];for(const k of ['gold','ore','cq','tq','charm']){const n=Math.round(rw[k]||0);if(n>0)o.push(`<span class="nvChip k-${k}">+${k==='gold'||k==='cq'?fmt(n):n} ${RWN[k]}</span>`)}
  if(rw.exp)o.push(`<span class="nvChip">+${fmt(rw.exp)} KN</span>`);return o.join('')}
const OF_MAP={nv_su_gia:'aothe',nv_hoa_rong:'ngothan',nv_ngu_phu:'quaithao'};
function ofUnlock(id){try{const O=window.OF;if(!O)return;const k=OF_MAP[id]||id;if(typeof O.grant==='function')O.grant(k,'Kỳ Ngộ');else if(typeof O.unlock==='function')O.unlock(k)}catch(e){}}
const towerOn=()=>!!(window.VT&&VT.on);

/* ================= ĐẶT NPC, BIA, RƯƠNG TRÊN BẢN ĐỒ ================= */
const P_ONGDO={x:12.9,y:57.1},P_FISH={x:12.7,y:54.2},P_TIEU={x:9.6,y:38.3};
if(typeof LOOKS==='object'){
  if(!LOOKS.ongdo)LOOKS.ongdo=Object.assign({},LOOKS.elder,{robe:'#2a3448',robe2:'#c9a24e',pants:'#e8e2d0',sash:'#7a1f14',wp:'none'});
  if(!LOOKS.tieudau)LOOKS.tieudau=Object.assign({},LOOKS.master,{robe:'#5a3a24',robe2:'#c8361f',pants:'#2a1a14',sash:'#c8361f',armor:'leather',hat:'scarf',hatC:'#c8361f',wp:'spear',wc:'#cfd5da',beard:'stache'})}
function tileOk(W,tx,ty){if(tx<2||ty<2||tx>MW-3||ty>MH-3)return false;const i=ty*MW+tx;if(!W.walkLocked[i]||W.solid[i])return false;const t=W.tile[i];if(t===TW||t===TP||t===TB)return false;
  if(tx<=TOWN.x1+3&&ty>=TOWN.y0-3)return false;if(dist(tx+.5,ty+.5,W.arena.x/T,W.arena.y/T)<9)return false;const o=W.ogrid[i];if(o&&o.length)return false;return true}
function placeNV(W){const mi=W.mi,R=mulberry32((W.M.seed||mi+1)*977+mi*31+5),pts=W.pathPts,add=[];
  add.push({id:'nv_ongdo',name:'Ông Đồ',x:P_ONGDO.x*T,y:P_ONGDO.y*T,look:'ongdo',act:'nv_quiz',nv:'ongdo'});
  add.push({id:'nv_fish',name:'Bến Câu',x:P_FISH.x*T,y:P_FISH.y*T,act:'nv_fish',nv:'fish'});
  add.push({id:'nv_tieu',name:'Tiêu Đầu',x:P_TIEU.x*T,y:P_TIEU.y*T,look:'tieudau',act:'nv_esc',nv:'tieu'});
  const used=[];
  /* bia đá: cạnh đường mòn ở 30% và 64% quãng đường */
  [0.3,0.64].forEach((f,k)=>{const b=pts[Math.floor(pts.length*f)];let got=null;
    for(let tries=0;tries<80&&!got;tries++){const a=R()*TAU,r=2.2+R()*1.8+tries*0.03;const tx=Math.floor(b.x/T+Math.cos(a)*r),ty=Math.floor(b.y/T+Math.sin(a)*r);if(tileOk(W,tx,ty))got={x:(tx+.5)*T,y:(ty+.75)*T}}
    if(!got)got={x:b.x+T*1.6,y:b.y};used.push(got);
    add.push({id:'nv_bia'+k,name:'Bia Đá',x:got.x,y:got.y,act:'nv_bia',nv:'bia',k})});
  /* rương bí ẩn: chỗ khuất, xa đường mòn */
  const far=(x,y,m)=>{for(let i=0;i<pts.length;i+=3)if(dist2(x,y,pts[i].x,pts[i].y)<m*m)return false;return true};
  const ch=[];for(const lim of [6.5,5,3.5]){for(let tries=0;tries<500&&ch.length<3;tries++){const i=W.spawnTiles[Math.floor(R()*W.spawnTiles.length)];if(i==null)break;const tx=i%MW,ty=(i/MW)|0;
      if(!tileOk(W,tx,ty))continue;const x=(tx+.5)*T,y=(ty+.7)*T;if(!far(x,y,lim*T))continue;if(ch.concat(used).some(q=>dist(q.x,q.y,x,y)<12*T))continue;ch.push({x,y})}if(ch.length>=3)break}
  ch.forEach((q,k)=>add.push({id:'nv_chest'+k,name:'Rương Bí Ẩn',x:q.x,y:q.y,act:'nv_chest',nv:'chest',k}));
  for(const n of add)W.npcs.push(n)}
const _mw=makeWorld;makeWorld=function(){const W=_mw.apply(this,arguments);try{placeNV(W)}catch(e){console.error(e)}return W};

/* ================= VẼ ================= */
const SPR={};
function spr(key,w,h,fn){let c=SPR[key];if(c)return c;c=document.createElement('canvas');const k=2;c.width=w*k;c.height=h*k;const g=c.getContext('2d');g.scale(k,k);g.lineJoin='round';g.lineCap='round';fn(g);c.w=w;c.h=h;SPR[key]=c;return c}
/* bia đá trên lưng rùa (gốc ở đáy giữa: 70×110) */
function biaSpr(read){return spr('bia'+(read?1:0),70,110,g=>{g.translate(35,104);
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(0,0,30,7,0,0,TAU);g.fill();
  // rùa đá
  g.fillStyle='#5f6a60';g.strokeStyle='#2a2f2a';g.lineWidth=1.3;
  for(const[x,y]of[[-18,-3],[16,-3],[-12,1],[10,1]]){g.beginPath();g.ellipse(x,y,6,3.5,0,0,TAU);g.fill();g.stroke()}
  g.beginPath();g.ellipse(27,-9,7,5,-0.2,0,TAU);g.fill();g.stroke();g.fillStyle='#1a1a1a';g.beginPath();g.arc(30,-11,1,0,TAU);g.fill();
  const sh=g.createLinearGradient(0,-26,0,-2);sh.addColorStop(0,'#8a968a');sh.addColorStop(1,'#56605a');g.fillStyle=sh;g.beginPath();g.ellipse(0,-10,25,12,0,Math.PI,TAU);g.lineTo(25,-6);g.quadraticCurveTo(0,-1,-25,-6);g.closePath();g.fill();g.stroke();
  g.strokeStyle='rgba(30,36,30,.55)';g.lineWidth=1;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*9-4,-19+Math.abs(i)*2);g.lineTo(i*9+4,-19+Math.abs(i)*2);g.lineTo(i*9+6,-12);g.lineTo(i*9-6,-12);g.closePath();g.stroke()}
  // thân bia
  const st=g.createLinearGradient(-16,0,16,0);st.addColorStop(0,'#8c897f');st.addColorStop(0.45,'#b9b5aa');st.addColorStop(1,'#7a776e');
  g.fillStyle=st;g.strokeStyle='#3a3630';g.lineWidth=1.5;g.beginPath();g.moveTo(-15,-20);g.lineTo(-15,-78);g.quadraticCurveTo(-15,-96,0,-97);g.quadraticCurveTo(15,-96,15,-78);g.lineTo(15,-20);g.closePath();g.fill();g.stroke();
  g.strokeStyle='rgba(60,54,46,.6)';g.lineWidth=1;g.beginPath();g.moveTo(-11,-24);g.lineTo(-11,-74);g.quadraticCurveTo(-11,-90,0,-91);g.quadraticCurveTo(11,-90,11,-74);g.lineTo(11,-24);g.closePath();g.stroke();
  // trán bia: mây cuộn
  g.strokeStyle='rgba(60,54,46,.75)';g.lineWidth=1.2;g.beginPath();g.arc(-4,-83,3.4,0,Math.PI*1.6);g.moveTo(7.4,-83);g.arc(4,-83,3.4,0,Math.PI*1.6);g.stroke();
  // chữ khắc
  g.strokeStyle=read?'rgba(58,52,44,.75)':'#e8b84a';g.lineWidth=1.4;
  for(let c=0;c<3;c++){const x=-6+c*6;for(let r=0;r<6;r++){const y=-70+r*7.5;g.beginPath();g.moveTo(x-1.8,y);g.lineTo(x+1.8,y);if((r+c)%2){g.moveTo(x,y-2);g.lineTo(x,y+2)}g.stroke()}}
  // rêu
  g.fillStyle='rgba(90,120,60,.55)';for(const[x,y,r]of[[-13,-24,3],[12,-30,2.4],[-9,-58,1.6],[-20,-6,2.2]]){g.beginPath();g.arc(x,y,r,0,TAU);g.fill()}
})}
/* án thư và phướn của Ông Đồ (gốc 0,0 = chân ông đồ) */
function deskSpr(){return spr('desk',120,110,g=>{g.translate(60,100);
  // phướn đỏ
  g.strokeStyle='#4a2a14';g.lineWidth=2.4;g.beginPath();g.moveTo(-40,0);g.lineTo(-40,-92);g.stroke();g.beginPath();g.moveTo(-46,-90);g.lineTo(-22,-90);g.stroke();
  g.fillStyle='#b8321f';g.strokeStyle='#5a1408';g.lineWidth=1;g.beginPath();g.moveTo(-38,-88);g.lineTo(-24,-88);g.lineTo(-24,-30);g.lineTo(-31,-36);g.lineTo(-38,-30);g.closePath();g.fill();g.stroke();
  g.strokeStyle='#ffd98a';g.lineWidth=0.8;g.strokeRect(-36.5,-86,11,49);
  g.fillStyle='#ffe2a0';g.font='700 8px "Be Vietnam Pro",system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';['ĐỐ','SỬ','VIỆT'].forEach((t,i)=>g.fillText(t,-31,-76+i*13));
  // chiếu
  g.fillStyle='#c8a868';g.strokeStyle='#7a5a2a';g.lineWidth=1;g.beginPath();g.moveTo(-26,2);g.lineTo(30,2);g.lineTo(24,-10);g.lineTo(-20,-10);g.closePath();g.fill();g.stroke();
  g.strokeStyle='rgba(122,90,42,.5)';for(let i=-18;i<26;i+=5){g.beginPath();g.moveTo(i,-9);g.lineTo(i+2,1);g.stroke()}
  // án thư thấp
  g.fillStyle='#5a2a14';g.strokeStyle='#2a140a';g.lineWidth=1.2;g.fillRect(-20,-9,3,9);g.fillRect(19,-9,3,9);
  g.beginPath();g.roundRect(-24,-14,50,6,2);g.fill();g.stroke();
  // giấy dó, nghiên, bút
  g.fillStyle='#f4ead2';g.beginPath();g.moveTo(-14,-14);g.lineTo(8,-14);g.lineTo(10,-18);g.lineTo(-12,-18);g.closePath();g.fill();
  g.strokeStyle='#1a1410';g.lineWidth=1.1;g.beginPath();g.moveTo(-8,-16.5);g.lineTo(-5,-15.5);g.moveTo(-2,-17);g.lineTo(1,-15.4);g.moveTo(3,-16.8);g.lineTo(5,-15.6);g.stroke();
  g.fillStyle='#c8361f';g.fillRect(6,-17.4,2,2);
  g.fillStyle='#2a2626';g.beginPath();g.ellipse(17,-15.5,4.5,2,0,0,TAU);g.fill();
  g.strokeStyle='#8a5a2a';g.lineWidth=1.4;g.beginPath();g.moveTo(12,-20);g.lineTo(21,-16);g.stroke();
})}
/* bến câu: cầu gỗ nhô ra hồ (vẽ dưới mọi vật) */
function drawJetty(){const x=P_FISH.x*T,y=P_FISH.y*T,g=cx;g.save();
  g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x-15,y-70,32,74);
  for(let i=0;i<7;i++){const yy=y-6-i*10;g.fillStyle=i%2?'#8a6038':'#9a6c40';g.strokeStyle='#4a2e18';g.lineWidth=1;g.beginPath();g.rect(x-16,yy-9,32,9);g.fill();g.stroke()}
  g.fillStyle='#5a3a20';for(const px of[-16,13])for(const py of[-28,-66]){g.fillRect(x+px,y+py,4,10)}
  g.restore()}
function drawFishProps(n){const g=cx,x=n.x,y=n.y;g.save();
  // giỏ cá tre
  g.fillStyle='#b8904a';g.strokeStyle='#5a4020';g.lineWidth=1.2;g.beginPath();g.moveTo(x+18,y);g.quadraticCurveTo(x+12,y-12,x+16,y-18);g.lineTo(x+30,y-18);g.quadraticCurveTo(x+34,y-12,x+28,y);g.closePath();g.fill();g.stroke();
  g.strokeStyle='rgba(90,64,32,.6)';g.beginPath();g.moveTo(x+15,y-9);g.lineTo(x+31,y-9);g.moveTo(x+16,y-14);g.lineTo(x+30,y-14);g.stroke();
  // giá cần câu
  g.strokeStyle='#4a2e18';g.lineWidth=2;g.beginPath();g.moveTo(x-22,y);g.lineTo(x-22,y-30);g.moveTo(x-30,y-24);g.lineTo(x-14,y-24);g.stroke();
  g.strokeStyle='#c8a868';g.lineWidth=1.6;g.beginPath();g.moveTo(x-28,y-2);g.lineTo(x-10,y-62);g.moveTo(x-24,y-1);g.lineTo(x-2,y-56);g.stroke();
  g.strokeStyle='rgba(240,240,240,.6)';g.lineWidth=0.6;g.beginPath();g.moveTo(x-10,y-62);g.lineTo(x-8,y-40);g.stroke();
  // biển
  g.fillStyle='#6a4426';g.fillRect(x-2,y-34,3,34);g.fillStyle='#e8d8a8';g.strokeStyle='#4a2e18';g.lineWidth=1;g.beginPath();g.roundRect(x-16,y-48,32,15,2);g.fill();g.stroke();
  g.fillStyle='#5a2a14';g.font='700 8.5px "Be Vietnam Pro",system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('CÂU CÁ',x,y-40.5);
  g.restore()}
/* xe bò chở hàng: gốc ở giữa hai trục, f=1 quay phải */
function wheel(g,x,y,r,a,col,al){g.save();g.globalAlpha=al;g.translate(x,y);g.strokeStyle='#2a180c';g.lineWidth=4.6;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();
  g.strokeStyle=col;g.lineWidth=3;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();g.rotate(a);g.lineWidth=2;g.beginPath();for(let i=0;i<8;i++){const b=i*TAU/8;g.moveTo(Math.cos(b)*3,Math.sin(b)*3);g.lineTo(Math.cos(b)*(r-1),Math.sin(b)*(r-1))}g.stroke();
  g.fillStyle='#3a3a40';g.beginPath();g.arc(0,0,3.6,0,TAU);g.fill();g.fillStyle='#8a8e94';g.beginPath();g.arc(-0.8,-0.8,1.4,0,TAU);g.fill();g.restore()}
function leg(g,x,y0,a,len,w,col){const fx=x+Math.sin(a)*len*0.9,fy=y0+Math.cos(a)*len;g.strokeStyle='#2a180c';g.lineWidth=w+2;g.beginPath();g.moveTo(x,y0);g.lineTo(fx,fy);g.stroke();g.strokeStyle=col;g.lineWidth=w;g.stroke();
  g.fillStyle='#1a1008';g.beginPath();g.ellipse(fx+1,fy,w*0.62,2,0,0,TAU);g.fill()}
function drawCart(g,x,y,f,o){g.save();g.translate(x,y);g.scale(f,1);g.lineJoin='round';g.lineCap='round';
  const mv=o.mv?1:0,ph=o.walk||0,bob=mv?Math.abs(Math.sin(ph))*1.6:0,sw=0.42*mv;
  g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(4,1,82,11,0,0,TAU);g.fill();
  wheel(g,-30,-21,16,o.wa||0,'#5a3a22',0.6);
  // càng
  g.strokeStyle='#3a2414';g.lineWidth=4;g.beginPath();g.moveTo(-6,-31);g.lineTo(66,-46-bob);g.stroke();g.strokeStyle='#8a5a32';g.lineWidth=2.4;g.stroke();
  // bò: đuôi, chân xa
  const oc='#8e5c34',od='#5e3a1e';
  g.strokeStyle=od;g.lineWidth=2;g.beginPath();g.moveTo(28,-40-bob);g.quadraticCurveTo(22,-30,24+Math.sin((o.t||0)*3)*2,-20);g.stroke();g.fillStyle='#2a180c';g.beginPath();g.ellipse(24+Math.sin((o.t||0)*3)*2,-19,2,3.5,0,0,TAU);g.fill();
  leg(g,34,-28-bob,Math.sin(ph+Math.PI)*sw,27,5,od);leg(g,64,-28-bob,Math.sin(ph)*sw,27,5,od);
  // thân bò
  g.save();g.translate(0,-bob);
  g.fillStyle=oc;g.strokeStyle='#2a180c';g.lineWidth=1.5;g.beginPath();g.ellipse(50,-37,25,13.5,0,0,TAU);g.fill();g.stroke();
  g.fillStyle='rgba(255,230,190,.28)';g.beginPath();g.ellipse(48,-28,17,4.5,0,0,TAU);g.fill();
  g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.ellipse(46,-45,16,4,0,0,TAU);g.fill();
  g.fillStyle=oc;g.beginPath();g.ellipse(66,-47,7,5,0.3,0,TAU);g.fill();// u vai
  // cổ, đầu
  g.beginPath();g.moveTo(66,-48);g.quadraticCurveTo(78,-50,86,-44);g.lineTo(90,-32);g.quadraticCurveTo(84,-27,78,-29);g.quadraticCurveTo(72,-33,66,-30);g.closePath();g.fill();g.stroke();
  g.fillStyle='#c8a07a';g.beginPath();g.ellipse(88.5,-32.5,5,4,0.2,0,TAU);g.fill();g.stroke();g.fillStyle='#2a180c';g.beginPath();g.arc(90.5,-33,0.9,0,TAU);g.fill();
  g.fillStyle='#120a06';g.beginPath();g.arc(82,-40,1.3,0,TAU);g.fill();
  g.fillStyle=od;g.beginPath();g.ellipse(76,-46,4.5,2.2,-0.5,0,TAU);g.fill();
  g.strokeStyle='#2a180c';g.lineWidth=3.6;g.beginPath();g.moveTo(80,-46);g.quadraticCurveTo(82,-55,88,-56);g.stroke();g.strokeStyle='#efe2c4';g.lineWidth=2.2;g.stroke();
  // ách
  g.fillStyle='#6a4426';g.strokeStyle='#2a180c';g.lineWidth=1.2;g.beginPath();g.roundRect(60,-55,13,5,2);g.fill();g.stroke();
  g.restore();
  leg(g,40,-28-bob,Math.sin(ph)*sw,27,5.6,oc);leg(g,70,-28-bob,Math.sin(ph+Math.PI)*sw,27,5.6,oc);
  // thùng xe
  g.fillStyle='#7a4e2a';g.strokeStyle='#2a180c';g.lineWidth=1.4;g.beginPath();g.rect(-74,-40,70,12);g.fill();g.stroke();
  g.strokeStyle='rgba(42,24,12,.6)';g.lineWidth=1;g.beginPath();g.moveTo(-74,-34);g.lineTo(-4,-34);for(let i=-62;i<-4;i+=14){g.moveTo(i,-40);g.lineTo(i,-28)}g.stroke();
  // hàng hóa
  g.fillStyle='#c09050';g.strokeStyle='#4a2e18';g.lineWidth=1.2;g.beginPath();g.rect(-70,-64,24,24);g.fill();g.stroke();g.beginPath();g.moveTo(-70,-64);g.lineTo(-46,-40);g.moveTo(-46,-64);g.lineTo(-70,-40);g.stroke();
  g.fillStyle='#a8784a';g.beginPath();g.rect(-44,-58,18,18);g.fill();g.stroke();
  g.fillStyle='#d8c8a0';g.beginPath();g.ellipse(-16,-47,11,8,0,0,TAU);g.fill();g.stroke();g.strokeStyle='#8a6a3a';g.beginPath();g.moveTo(-16,-55);g.lineTo(-14,-51);g.stroke();
  g.fillStyle='#2f4a6b';g.globalAlpha=0.9;g.beginPath();g.moveTo(-72,-64);g.quadraticCurveTo(-58,-72,-44,-60);g.lineTo(-44,-56);g.quadraticCurveTo(-58,-66,-72,-60);g.closePath();g.fill();g.globalAlpha=1;
  // cờ tiêu cục
  g.strokeStyle='#3a2414';g.lineWidth=2;g.beginPath();g.moveTo(-76,-38);g.lineTo(-76,-96);g.stroke();
  const fl=Math.sin((o.t||0)*5)*2;g.fillStyle='#c8361f';g.strokeStyle='#ffd23a';g.lineWidth=1.2;g.beginPath();g.moveTo(-75,-95);g.lineTo(-52,-90+fl);g.lineTo(-56,-82+fl*0.6);g.lineTo(-52,-74+fl);g.lineTo(-75,-76);g.closePath();g.fill();g.stroke();
  g.save();g.scale(f,1);g.fillStyle='#ffe7a0';g.font='800 8px "Be Vietnam Pro",system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('TIÊU',f*-64,-85+fl*0.5);g.restore();
  wheel(g,-38,-19,18,o.wa||0,'#7a5030',1);
  if(o.hurt>0){g.globalCompositeOperation='source-atop';g.globalAlpha=Math.min(0.5,o.hurt*2);g.fillStyle='#ff3a2a';g.fillRect(-90,-100,190,105)}
  g.restore()}
/* rương khóa: dùng hình rương báu gốc, thêm ổ khóa; đã mở thì nắp bật, ruột rỗng */
function drawLockChest(n,opened){const g=cx;
  if(!opened){drawChest({x:n.x},n.y);g.save();g.translate(n.x,n.y);
    g.strokeStyle='#5a5e66';g.lineWidth=2;g.beginPath();g.arc(0,-9,3.4,Math.PI,TAU);g.stroke();
    g.fillStyle='#8a8e94';g.strokeStyle='#2a2a2e';g.lineWidth=1;g.beginPath();g.roundRect(-4.5,-9,9,8,1.5);g.fill();g.stroke();g.fillStyle='#2a2a2e';g.fillRect(-0.8,-6.5,1.6,3);
    g.strokeStyle='rgba(60,60,66,.8)';g.lineWidth=1.4;g.beginPath();g.moveTo(-13,-6);g.quadraticCurveTo(-8,-2,-4,-5);g.moveTo(13,-6);g.quadraticCurveTo(8,-2,4,-5);g.stroke();g.restore();return}
  g.save();g.translate(n.x,n.y);g.globalAlpha=0.85;g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(0,0,15,4,0,0,TAU);g.fill();
  g.fillStyle='#6a3e1e';g.strokeStyle='#1a100a';g.lineWidth=1.2;g.beginPath();g.roundRect(-13,-14,26,14,2);g.fill();g.stroke();
  g.fillStyle='#1a0e08';g.beginPath();g.rect(-11,-14,22,3);g.fill();
  g.fillStyle='#7a4a26';g.beginPath();g.moveTo(-13,-14);g.lineTo(-11,-30);g.quadraticCurveTo(0,-36,11,-30);g.lineTo(13,-14);g.closePath();g.fill();g.stroke();
  g.fillStyle='#b8902a';g.fillRect(-13,-15,26,2);g.restore()}
function drawKey(x,y){const g=cx;additive(()=>glow(x,y-10,16,'#ffd23a',0.55));g.save();g.translate(x,y-10);g.rotate(-0.5);
  g.strokeStyle='#4a3008';g.lineWidth=4.2;g.beginPath();g.arc(-6,0,4,0,TAU);g.moveTo(-2,0);g.lineTo(9,0);g.moveTo(5,0);g.lineTo(5,4);g.moveTo(8,0);g.lineTo(8,3.4);g.stroke();
  g.strokeStyle='#ffd23a';g.lineWidth=2.2;g.stroke();g.restore()}
function inView(x,y,m){const z=G.cam.z,vw=VW/z,vh=VH/z;return x>G.cam.x-vw/2-m&&x<G.cam.x+vw/2+m&&y>G.cam.y-vh/2-m&&y<G.cam.y+vh/2+m+120}
function label(n,txt,col,dy){const g=cx;g.font='700 12px "Be Vietnam Pro",system-ui,sans-serif';g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(20,10,5,0.85)';g.strokeText(txt,n.x,n.y-dy);g.fillStyle=col||'#ffe2a0';g.fillText(txt,n.x,n.y-dy)}
function marker(n,dy,col){const g=cx,b=Math.sin(G.t*3)*3;g.fillStyle=col||'#ffd23a';g.strokeStyle='rgba(40,20,5,.8)';g.lineWidth=1.5;g.beginPath();g.moveTo(n.x,n.y-dy+b);g.lineTo(n.x-6,n.y-dy-10+b);g.lineTo(n.x+6,n.y-dy-10+b);g.closePath();g.fill();g.stroke()}
const _dn=drawNpc;drawNpc=function(n){if(!n||!n.nv)return _dn.apply(this,arguments);if(!inView(n.x,n.y,140))return;
  const s=S_(),mi=G.W.mi,near=G.nearNpc===n;
  switch(n.nv){
    case'ongdo':{_dn.apply(this,arguments);const d=deskSpr();cx.drawImage(d,n.x-60,n.y-90,120,110);if(s&&s.qz<QUIZ_N&&!near)marker(n,98,'#ffd23a');break}
    case'tieu':{if(!NV.Esc)drawCart(cx,n.x+124,n.y+4,-1,{t:G.t,wa:0});_dn.apply(this,arguments);if(s&&Lv()>=ESC_LV&&s.esc<ESC_N&&!near&&!NV.Esc)marker(n,98,'#ffd23a');break}
    case'fish':drawFishProps(n);marker(n,56,near?'#ffd23a':'#9fe0a8');break;
    case'bia':{const key=mi+'-'+n.k,read=!!(s&&s.bia[key]),c=biaSpr(read);cx.drawImage(c,n.x-35,n.y-104,70,110);
      if(!read){additive(()=>glow(n.x,n.y-62,30+Math.sin(G.t*3)*4,'#ffd23a',0.35));if(Math.random()<0.08)addPart(n.x+rand(-12,12),n.y-rand(30,90),0,rand(-30,-14),0.9,'#ffe7a8',2,-10,'c',1)}
      label(n,read?'Bia Đá (đã đọc)':'Bia Đá',read?'#c8bca0':'#ffe2a0',112);if(near||!read)marker(n,118,read?'#c8bca0':'#ffd23a');break}
    case'chest':{const key=mi+'-'+n.k,op=!!(s&&s.chest[key]===today());drawLockChest(n,op);label(n,op?'Rương đã mở':'Rương Bí Ẩn',op?'#c8bca0':'#ffd98a',44);if(near)marker(n,50);break}
  }};
const _dtu=drawTownUnder;drawTownUnder=function(left,top,vw,vh){const r=_dtu.apply(this,arguments);try{const x=P_FISH.x*T,y=P_FISH.y*T;if(x>left-80&&x<left+vw+80&&y>top-120&&y<top+vh+80)drawJetty()}catch(e){console.error(e)}return r};

/* ================= GIAO DIỆN PHỦ (cuộn giấy đố, bến câu, thẻ kết quả) ================= */
const CSS=`
#nvOv{background:rgba(14,9,6,.66);padding:max(12px,env(safe-area-inset-top,0px)) 12px max(12px,env(safe-area-inset-bottom,0px));justify-content:center;overflow:auto;touch-action:pan-y}
#nvOv[hidden]{display:none}
.nvBox{width:min(540px,100%);margin:auto 0}
.nvScroll{position:relative;filter:drop-shadow(0 18px 40px rgba(0,0,0,.6))}
.nvRoll{height:18px;margin:0 -6px;border-radius:9px;background:linear-gradient(#a0442a,#6a1a0e 55%,#4a1008);border:1px solid #2a0a04;position:relative;z-index:1}
.nvRoll::before,.nvRoll::after{content:"";position:absolute;top:-3px;width:14px;height:22px;border-radius:5px;background:linear-gradient(#ffe08a,#c9902a);border:1px solid #6a4a10}
.nvRoll::before{left:-8px}.nvRoll::after{right:-8px}
.nvPaper{position:relative;margin:-4px 4px;padding:18px 18px 16px;color:#2a1a10;
  background:radial-gradient(circle at 18% 12%,rgba(255,255,255,.5),transparent 42%),radial-gradient(circle at 85% 80%,rgba(255,250,235,.38),transparent 45%),repeating-linear-gradient(115deg,rgba(255,255,255,.08) 0 2px,rgba(160,130,90,.05) 2px 5px),var(--diep);
  box-shadow:inset 10px 0 14px -10px rgba(90,60,20,.45),inset -10px 0 14px -10px rgba(90,60,20,.45)}
.nvHead{display:flex;align-items:center;justify-content:space-between;gap:10px;font:700 12px/1.2 var(--f-ui);letter-spacing:.06em;color:#7a1f14}
.nvHead .n{font-variant-numeric:tabular-nums;color:#5a3a20;letter-spacing:0}
.nvTitle{font:400 26px/1.1 var(--f-display);color:#7a1f14;margin:4px 0 8px}
.nvTimer{height:5px;border-radius:3px;background:rgba(122,31,20,.15);margin:8px 0 2px;overflow:hidden}
.nvTimer i{display:block;height:100%;background:linear-gradient(90deg,#c8361f,#e2b24a);transform-origin:left center}
.nvQ{font:600 17px/1.45 var(--f-ui);margin:10px 0 12px;color:#2a1a10}
.nvOpts{display:grid;grid-template-columns:1fr;gap:8px}
@media(min-width:560px){.nvOpts{grid-template-columns:1fr 1fr}}
.nvOpt{display:flex;align-items:center;gap:10px;min-height:48px;padding:9px 12px;text-align:left;border-radius:10px;border:1.5px solid rgba(122,31,20,.35);background:rgba(122,31,20,.06);color:#2a1a10;font:600 15px/1.3 var(--f-ui);transition:background .15s,transform .1s}
.nvOpt:active{transform:scale(.98)}
.nvOpt b{flex:0 0 26px;height:26px;border-radius:50%;display:grid;place-items:center;background:#7a1f14;color:#ffe7b0;font:800 12px var(--f-ui)}
.nvOpt.ok{background:rgba(47,122,58,.16);border-color:#2f7a3a;animation:nvPop .4s}.nvOpt.ok b{background:#2f7a3a}
.nvOpt.bad{background:rgba(200,54,31,.14);border-color:#c8361f;animation:nvShake .42s}.nvOpt.bad b{background:#c8361f}
.nvOpt.dim{opacity:.5}
.nvFb{display:flex;gap:12px;align-items:flex-start;margin-top:12px;padding-top:12px;border-top:1px dashed rgba(122,31,20,.35)}
.nvStamp{flex:0 0 58px;height:58px;border-radius:4px;border:2.5px solid #b8321f;color:#b8321f;display:grid;place-items:center;font:400 14px/1.05 var(--f-display);text-align:center;transform:rotate(8deg);animation:nvStampIn .38s cubic-bezier(.2,1.4,.4,1)}
.nvStamp.ok{border-color:#2f7a3a;color:#2f7a3a}
.nvEx{font:500 14px/1.5 var(--f-ui);margin:0}
.nvLore{margin:10px 0 0;padding:8px 12px;border-left:3px solid #b8321f;background:rgba(122,31,20,.06);font:italic 500 14px/1.55 var(--f-ui);color:#4a2a14}
.nvRw{margin-top:6px}
.nvChip{display:inline-block;margin:2px 4px 2px 0;padding:3px 8px;border-radius:6px;background:#2a1d16;color:#ffd98a;font:700 12px/1.3 var(--f-ui)}
.nvRow{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;margin-top:14px}
.nvRow .btn{min-height:46px}
.nvP{font:500 14.5px/1.55 var(--f-ui);margin:0 0 10px}
.nvSum{display:flex;gap:6px;justify-content:center;margin:8px 0}
.nvSum i{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font:800 13px var(--f-ui);font-style:normal;color:#fff;background:#b8321f}
.nvSum i.ok{background:#2f7a3a}
.nvBoard.shake{animation:nvShake .42s}
@keyframes nvShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}
@keyframes nvStampIn{0%{transform:scale(2.3) rotate(-14deg);opacity:0}70%{transform:scale(.92) rotate(9deg);opacity:1}100%{transform:scale(1) rotate(8deg)}}
@keyframes nvPop{0%{transform:scale(1)}45%{transform:scale(1.04)}100%{transform:scale(1)}}
@keyframes nvIn{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}
.nvBox>*{animation:nvIn .3s ease-out}
/* bến câu */
.nvFish{padding:12px;border-radius:16px;background:linear-gradient(170deg,#3a2618,#1d1410 70%);border:1px solid var(--line);box-shadow:0 18px 50px rgba(0,0,0,.6)}
.nvFish .hd{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.nvFish .hd h3{flex:1;margin:0;font:400 22px/1.1 var(--f-display);color:var(--vang2)}
.nvFish .hd span{font:700 12.5px var(--f-ui);color:var(--dim)}
.nvFish .x{width:44px;height:44px;border-radius:10px;display:grid;place-items:center;background:rgba(0,0,0,.3);border:1px solid var(--line)}
.nvFish .x svg{width:20px;height:20px}
.nvCvW{position:relative;border-radius:12px;overflow:hidden;border:1px solid rgba(226,178,74,.3);touch-action:none}
.nvCvW canvas{display:block;width:100%;height:230px}
.nvMsg{min-height:22px;margin:8px 0 6px;text-align:center;font:700 14px/1.4 var(--f-ui);color:var(--ink)}
.nvMsg.hot{color:#ffd23a}.nvMsg.bad{color:#ff8a6a}
.nvBar{position:relative;height:24px;border-radius:12px;background:#140d09;border:1px solid rgba(226,178,74,.3);overflow:hidden}
.nvBar .z{position:absolute;top:0;bottom:0;left:0;background:linear-gradient(#5fd06a,#2f8a3a);opacity:.85;border-radius:8px}
.nvBar .d{position:absolute;top:0;bottom:0;right:0;width:9%;background:linear-gradient(90deg,transparent,rgba(255,60,40,.6))}
.nvBar .k{position:absolute;top:-2px;bottom:-2px;left:0;width:5px;margin-left:-2.5px;border-radius:3px;background:#fff6dc;box-shadow:0 0 8px #fff}
.nvBar .pw{position:absolute;top:0;bottom:0;left:0;width:100%;transform-origin:left center;background:linear-gradient(90deg,#3f7fe0,#ffd23a 70%,#ff5b3d)}
.nvProg{height:8px;margin-top:6px;border-radius:4px;background:#140d09;overflow:hidden}
.nvProg i{display:block;height:100%;width:100%;transform-origin:left center;transform:scaleX(0);background:linear-gradient(90deg,#c9902a,#ffd98a)}
.nvLbl{display:flex;justify-content:space-between;font:600 11.5px var(--f-ui);color:var(--dim);margin:6px 2px 4px}
.nvBig{width:100%;min-height:58px;margin-top:10px;font-size:17px}
.nvCatch{text-align:center;padding:6px 0 2px}
.nvCatch canvas{width:200px;height:100px}
.nvCatch h4{margin:4px 0 2px;font:400 24px/1.1 var(--f-display)}
.nvCatch .w{font:700 15px var(--f-ui);color:var(--ink)}
.nvCatch .rec{display:inline-block;margin-left:6px;padding:2px 8px;border-radius:6px;background:#c8361f;color:#fff;font:800 11px var(--f-ui);animation:nvStampIn .4s}
.nvCatch p{font:500 13px/1.45 var(--f-ui);color:var(--dim);margin:6px 0}
/* thẻ Kỳ Ngộ trong Võ Đạo */
.nvSegs{display:flex;gap:6px;margin-bottom:12px}
.nvSegs button{flex:1;min-height:44px;border-radius:10px;border:1px solid var(--line);background:rgba(0,0,0,.25);color:var(--dim);font:700 13.5px var(--f-ui)}
.nvSegs button[aria-pressed="true"]{color:var(--muc);background:linear-gradient(#ffd98a,#e2b24a);border-color:#ffd98a}
.nvCard{display:grid;grid-template-columns:44px minmax(0,1fr);gap:10px;padding:12px;margin-bottom:10px;border:1px solid var(--line);border-radius:12px;background:rgba(0,0,0,.22)}
.nvCard .ic{width:44px;height:44px;border-radius:10px;display:grid;place-items:center;background:radial-gradient(circle at 40% 35%,#4a3020,#1d1410);border:1px solid rgba(226,178,74,.35)}
.nvCard .ic svg{width:26px;height:26px}
.nvCard h5{margin:2px 0 4px;font:700 15px var(--f-ui);color:var(--vang2)}
.nvCard p{margin:0 0 6px;font:500 13px/1.45 var(--f-ui);color:var(--dim)}
.nvPills{display:flex;flex-wrap:wrap;gap:4px}
.nvPills span{padding:3px 9px;border-radius:999px;background:rgba(226,178,74,.12);border:1px solid rgba(226,178,74,.25);font:700 12px/1.3 var(--f-ui);color:var(--ink)}
.nvPills span.done{background:rgba(95,208,106,.15);border-color:rgba(95,208,106,.4);color:#bff0c4}
.nvBtns{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.nvBtns .btn{min-height:44px}
.nvCodex{display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:8px}
.nvFc{padding:8px;border-radius:10px;border:1px solid rgba(226,178,74,.22);background:rgba(0,0,0,.25);text-align:center;min-width:0}
.nvFc img{width:100%;height:54px;object-fit:contain}
.nvFc b{display:block;font:700 13px/1.3 var(--f-ui)}
.nvFc span{display:block;font:500 11.5px/1.4 var(--f-ui);color:var(--dim)}
.nvBk{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px dashed rgba(255,255,255,.08);font:600 13px var(--f-ui)}
.nvBk img{width:44px;height:24px;object-fit:contain}
.nvBk .nm{flex:1;min-width:0}
.nvSu{padding:10px 12px;margin-bottom:8px;border-radius:10px;border:1px solid rgba(226,178,74,.2);background:rgba(0,0,0,.2)}
.nvSu h6{margin:0 0 4px;font:700 13.5px var(--f-ui);color:var(--vang2)}
.nvSu p{margin:0;font:500 13px/1.5 var(--f-ui);color:var(--ink)}
.nvSu.lk h6{color:var(--dim)}.nvSu.lk p{color:var(--dim);font-style:italic}
.nvTrk{margin-top:4px;font:700 12px/1.35 var(--f-ui);color:#9fe0a8}
`;
const X_SVG='<svg viewBox="0 0 20 20" stroke="#f3e9d4" stroke-width="2.2" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>';
function dom(){if(NV.dom)return NV.dom;const st=document.createElement('style');st.id='nvCss';st.textContent=CSS;document.head.appendChild(st);
  const ov=document.createElement('section');ov.id='nvOv';ov.className='screen';ov.hidden=true;ov.innerHTML='<div class="nvBox" id="nvBox" role="dialog" aria-modal="true"></div>';
  (document.getElementById('app')||document.body).appendChild(ov);NV.dom={ov,box:ov.querySelector('#nvBox')};return NV.dom}
function ovOpen(kind,html){const d=dom();if(UI.panel)UI.close();d.box.innerHTML=html;d.ov.hidden=false;NV.ov=kind;G.paused=true;G.input.atk=false;G.input.mx=G.input.my=0;
  document.getElementById('npcBtn')&&(document.getElementById('npcBtn').hidden=true);loopStart();return d.box}
function ovClose(){const d=dom();NV.ov=null;NV.Q=null;NV.F=null;d.ov.hidden=true;d.box.innerHTML='';if(!UI.panel&&G.state!=='title')G.paused=false;
  G.nearNpc=null;saveGame()}
function card(head,title,body,btns){return`<div class="nvScroll"><div class="nvRoll"></div><div class="nvPaper"><div class="nvHead"><span>${head}</span></div>${title?`<div class="nvTitle">${title}</div>`:''}${body}<div class="nvRow">${btns}</div></div><div class="nvRoll"></div></div>`}
function bindBtns(box,map){box.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{Audio_.play('ui');const f=map[b.dataset.a];f&&f()})}
function simple(head,title,body,btns,map){const box=ovOpen('card',card(head,title,body,btns));bindBtns(box,Object.assign({close:ovClose},map||{}));const p=box.querySelector('.btn');p&&setTimeout(()=>p.focus({preventScroll:true}),30);return box}
let rafOn=false,lastTs=0;
function loopStart(){if(rafOn)return;rafOn=true;lastTs=0;requestAnimationFrame(loop)}
function loop(ts){if(!NV.ov){rafOn=false;return}requestAnimationFrame(loop);const dt=lastTs?Math.min(0.05,(ts-lastTs)/1000):0.016;lastTs=ts;if(!NV.manual){try{tickOv(dt)}catch(e){console.error(e)}}}
function tickOv(dt){if(NV.ov==='quiz')quizTick(dt);else if(NV.ov==='fish')fishTick(dt)}

/* ================= ĐỐ SỬ VIỆT ================= */
function maxCh(){const S=G.save;let m=S.map||0;m=Math.max(m,(S.unlocked||1)-1);if(S.cleared&&S.cleared.length)m=Math.max(m,Math.max.apply(null,S.cleared));if(S.ng)m=MAPS.length;return m}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function mkItem(era,q,opts,ex,extra){const ord=shuffle([0,1,2,3]);return Object.assign({era,q,opts:ord.map(i=>opts[i]),ans:ord.indexOf(0),ex},extra||{})}
function pickQs(n){const s=S_(),mc=maxCh();let pool=QZ.map((q,i)=>i).filter(i=>ERA[QZ[i][0]][1]<=mc+2);
  const eras=new Set(pool.map(i=>QZ[i][0]));if(eras.size<3)pool=QZ.map((q,i)=>i).filter(i=>ERA[QZ[i][0]][1]<=4);
  const fresh=pool.filter(i=>!s.qseen.includes(i));const src=fresh.length>=n?fresh:pool;
  return shuffle(src.slice()).slice(0,n).map(i=>{const q=QZ[i];return mkItem(q[0],q[1],q[2],q[3],{qi:i})})}
function quizStart(){const s=S_();if(!s)return;const left=QUIZ_N-s.qz;if(left<=0){ongDone();return}
  NV.Q={src:'ong',items:pickQs(left),i:0,base:s.qz,done:false,t:0,lim:30,res:[]};ovOpen('quiz','');renderQ()}
function biaStart(n){const s=S_(),mi=G.W.mi,key=mi+'-'+n.k,B=BIA[mi]&&BIA[mi][n.k];if(!B)return;
  if(s.bia[key]){biaLore(mi,n.k,false);return}
  const cd=(NV.biaCd||(NV.biaCd={}))[key];if(cd&&now()<cd){UI.toast('Nét chữ trên bia mờ đi... Thử lại sau '+Math.ceil((cd-now())/1000)+' giây.','warn');return}
  NV.Q={src:'bia',key,mi,k:n.k,items:[mkItem(MAPERA[mi]||'hv',B[2],B[3],B[4])],i:0,done:false,t:0,lim:0,res:[]};ovOpen('quiz','');renderQ()}
function renderQ(){const Q=NV.Q,it=Q.items[Q.i],box=dom().box;const L='ABCD';
  const head=Q.src==='bia'?`BIA ĐÁ · ${esc(MAPS[Q.mi].name.toUpperCase())}`:`ĐỐ SỬ VIỆT · ${esc(ERA[it.era][0].toUpperCase())}`;
  const n=Q.src==='bia'?'':`<span class="n">Câu ${Q.base+Q.i+1}/${QUIZ_N}</span>`;
  const title=Q.src==='bia'?esc(BIA[Q.mi][Q.k][0]):'';
  box.innerHTML=`<div class="nvScroll nvBoard"><div class="nvRoll"></div><div class="nvPaper"><div class="nvHead"><span>${head}</span>${n}</div>${title?`<div class="nvTitle">${title}</div>`:''}
    ${Q.lim?'<div class="nvTimer"><i id="nvTm"></i></div>':''}<div class="nvQ">${esc(it.q)}</div>
    <div class="nvOpts">${it.opts.map((o,i)=>`<button class="nvOpt" data-o="${i}"><b>${L[i]}</b><span>${esc(o)}</span></button>`).join('')}</div>
    <div id="nvFb"></div><div class="nvRow" id="nvNav"><button class="btn sec" data-a="close">Để sau</button></div></div><div class="nvRoll"></div></div>`;
  box.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>answer(+b.dataset.o));bindBtns(box,{close:ovClose});quizTick(0)}
function quizTick(dt){const Q=NV.Q;if(!Q||Q.done||!Q.lim)return;Q.t+=dt;const el=document.getElementById('nvTm');if(el)el.style.transform=`scaleX(${Math.max(0,1-Q.t/Q.lim)})`;if(Q.t>=Q.lim)answer(-1)}
function answer(o){const Q=NV.Q;if(!Q||Q.done)return;Q.done=true;const it=Q.items[Q.i],ok=o===it.ans,s=S_(),box=dom().box;Q.res.push(ok);
  box.querySelectorAll('[data-o]').forEach(b=>{const i=+b.dataset.o;b.disabled=true;if(i===it.ans)b.classList.add('ok');else if(i===o)b.classList.add('bad');else b.classList.add('dim')});
  let rw=null,extra='';
  if(Q.src==='ong'){s.qz++;if(it.qi!=null){s.qseen.push(it.qi);if(s.qseen.length>70)s.qseen.splice(0,s.qseen.length-70)}
    if(ok){s.qc++;rw={gold:15*Lv()+60,cq:Math.round(5+0.5*Lv())};give(rw,'nvquiz');cnt('quizOk');bumpD('nvquiz')}
    cnt('quiz')}
  else if(ok){s.bia[Q.key]=today();rw={gold:40*Lv()+200,cq:30+2*Lv(),ore:3,tq:1};give(rw,'nvbia');cnt('bia');const B=BIA[Q.mi][Q.k];extra=`<p class="nvLore">${esc(B[1])}</p>`;
    const nb=Object.keys(s.bia).length;if(nb>=BIA.length*2)ofUnlock('nv_su_gia')}
  else (NV.biaCd||(NV.biaCd={}))[Q.key]=now()+60000;
  Audio_.play(ok?'quest':'fail');if(!ok){const bd=box.querySelector('.nvBoard');bd&&(bd.classList.remove('shake'),void bd.offsetWidth,bd.classList.add('shake'))}
  const msg=o<0?'Hết giờ! ':'';
  document.getElementById('nvFb').innerHTML=`<div class="nvFb"><div class="nvStamp${ok?' ok':''}">${ok?'Đúng':'Sai'}</div><div><p class="nvEx">${msg}${ok?'':'Đáp án: <b>'+esc(it.opts[it.ans])+'</b>. '}${esc(it.ex)}</p>${rw?`<div class="nvRw">${chips(rw)}</div>`:''}${Q.src==='bia'&&ok?'<div class="nvRw"><span class="nvChip">+1 trang Sử Ký</span></div>':''}</div></div>${extra}`;
  const last=Q.src==='bia'||Q.i+1>=Q.items.length;
  document.getElementById('nvNav').innerHTML=last?`<button class="btn" data-a="next">${Q.src==='bia'?'Khắc vào Sử Ký':'Xem kết quả'}</button>`:`<button class="btn sec" data-a="close">Nghỉ</button><button class="btn" data-a="next">Câu tiếp</button>`;
  if(Q.src==='bia'&&!ok)document.getElementById('nvNav').innerHTML='<button class="btn" data-a="close">Đóng</button>';
  bindBtns(box,{close:ovClose,next});const nb=box.querySelector('#nvNav .btn:last-child');nb&&setTimeout(()=>nb.focus({preventScroll:true}),30);G.dirty.quest=1;saveGame()}
function next(){const Q=NV.Q;if(!Q)return;if(!Q.done)return;
  if(Q.src==='bia'){ovClose();UI.toast('Sử Ký thêm một trang: '+BIA[Q.mi][Q.k][0],'quest');return}
  if(Q.i+1<Q.items.length){Q.i++;Q.done=false;Q.t=0;renderQ();return}
  ongSummary()}
function ongSummary(){const s=S_(),Q=NV.Q;let bonus=null;
  if(s.qz>=QUIZ_N&&s.qBonus!==s.day){s.qBonus=s.day;if(s.qc>=QUIZ_N)bonus={tq:1,ore:3,cq:20+Lv()};else if(s.qc>=3)bonus={ore:2,cq:10+Lv()}}
  if(bonus)give(bonus,'nvquiz');
  const dots=Q.res.map(r=>`<i class="${r?'ok':''}">${r?'✓':'✗'}</i>`).join('');
  const body=`<div class="nvSum">${dots}</div><p class="nvP">${s.qz>=QUIZ_N?`Hôm nay đúng <b>${s.qc}/${QUIZ_N}</b> câu. ${s.qc>=QUIZ_N?'"Hậu sinh khả úy!" Ông Đồ tặng thêm sách quý.':s.qc>=3?'Ông Đồ gật gù khen ngợi.':'Ông Đồ khuyên đọc thêm sử sách, mai lại đến.'}`:`Còn ${QUIZ_N-s.qz} câu hôm nay. Lúc nào rảnh lại ghé.`}</p>${bonus?`<div class="nvRw">${chips(bonus)}</div>`:''}`;
  NV.Q=null;simple('ĐỐ SỬ VIỆT · ÔNG ĐỒ','Kết quả',body,'<button class="btn" data-a="close">Cảm tạ</button>')}
function ongDone(){const s=S_();const nb=Object.keys(s.bia).length;
  simple('ĐỐ SỬ VIỆT · ÔNG ĐỒ','Hẹn ngày mai',`<p class="nvP">"Mỗi ngày học một chút, lâu thành biển cả." Hôm nay con đã trả lời đủ ${QUIZ_N} câu (đúng ${s.qc}).</p><p class="nvP">Trên đường ra trận, hãy tìm những tấm <b>Bia Đá</b> để chép thêm vào Sử Ký (${nb}/${BIA.length*2} trang).</p>`,
    '<button class="btn sec" data-a="su">Xem Sử Ký</button><button class="btn" data-a="close">Đóng</button>',{su:()=>{ovClose();NV.hubView='su';HUB.show('kyngo')}})}
function biaLore(mi,k,fresh){const B=BIA[mi][k];simple('BIA ĐÁ · '+esc(MAPS[mi].name.toUpperCase()),esc(B[0]),`<p class="nvLore">${esc(B[1])}</p><p class="nvP" style="margin-top:10px">${esc(B[2])} <b>${esc(B[3][0])}</b>. ${esc(B[4])}</p>`,'<button class="btn" data-a="close">Đóng</button>')}

/* ================= CÂU CÁ ================= */
function fishShape(f){return f.pat==='cat'?0.27:f.id==='ro'?0.42:f.id==='qua'?0.3:f.pat==='dragon'?0.38:0.36}
function drawFishG(g,f,x,y,len,t,sil){const h=len*fishShape(f),c=f.c,sw=Math.sin(t||0)*0.12;g.save();g.translate(x,y);g.lineJoin='round';g.lineCap='round';
  const body=()=>{g.beginPath();g.moveTo(len*0.5,0);g.bezierCurveTo(len*0.42,-h*0.75,-len*0.1,-h*0.62,-len*0.36,-h*0.16);g.lineTo(-len*0.36,h*0.16);g.bezierCurveTo(-len*0.1,h*0.62,len*0.42,h*0.75,len*0.5,0);g.closePath()};
  const fin=sil?'#2e2620':f.pat==='dragon'?'#e0402a':f.pat==='koi'?'#f6e6d8':c[2];
  // đuôi
  g.save();g.translate(-len*0.35,0);g.rotate(sw);g.fillStyle=fin;g.strokeStyle=sil?'#1a1410':'rgba(20,12,6,.7)';g.lineWidth=1.2;g.beginPath();g.moveTo(0,-h*0.1);g.quadraticCurveTo(-len*0.12,-h*0.7,-len*0.2,-h*0.78);g.quadraticCurveTo(-len*0.12,0,-len*0.2,h*0.78);g.quadraticCurveTo(-len*0.12,h*0.7,0,h*0.1);g.closePath();g.fill();g.stroke();g.restore();
  // vây lưng
  g.fillStyle=fin;g.beginPath();g.moveTo(len*0.15,-h*0.6);g.quadraticCurveTo(-len*0.02,-h*(f.pat==='cat'?0.95:1.05),-len*0.22,-h*0.42);g.closePath();g.fill();g.stroke();
  if(sil){g.fillStyle='#2e2620';body();g.fill();g.restore();return}
  const gr=g.createLinearGradient(0,-h*0.7,0,h*0.7);gr.addColorStop(0,c[2]);gr.addColorStop(0.42,c[0]);gr.addColorStop(1,c[1]);g.fillStyle=gr;body();g.fill();
  g.save();body();g.clip();
  if(f.pat==='bars'){g.fillStyle='rgba(30,40,20,.35)';for(let i=-2;i<=3;i++)g.fillRect(i*len*0.11-2,-h,len*0.04,h*2)}
  if(f.pat==='scale'||f.pat==='lip'||f.pat==='dragon'){g.strokeStyle=f.pat==='dragon'?'rgba(255,240,170,.55)':'rgba(255,255,255,.22)';g.lineWidth=0.9;for(let i=-3;i<=3;i++)for(let j=-2;j<=2;j++){const sx=i*len*0.09+(j%2?len*0.045:0),sy=j*h*0.28;g.beginPath();g.arc(sx,sy,len*0.05,-1.2,1.2);g.stroke()}}
  if(f.pat==='blot'){g.fillStyle='rgba(20,20,10,.45)';for(const[a,b,r]of[[0.2,-0.2,0.08],[0,0.15,0.07],[-0.18,-0.12,0.07],[0.35,0.1,0.05]]){g.beginPath();g.ellipse(a*len,b*h*2,r*len,r*len*0.7,0,0,TAU);g.fill()}}
  if(f.pat==='koi'){g.fillStyle='#e8502a';for(const[a,b,r]of[[0.22,-0.25,0.12],[-0.05,0.05,0.1],[-0.22,-0.2,0.08]]){g.beginPath();g.ellipse(a*len,b*h*2,r*len,r*len*0.65,0.3,0,TAU);g.fill()}g.fillStyle='#1a1410';g.beginPath();g.ellipse(0.06*len,-0.35*h,0.035*len,0.025*len,0,0,TAU);g.fill()}
  if(f.pat==='cat'){g.fillStyle='rgba(255,255,255,.1)';g.fillRect(-len,-h*0.05,len*2,h*0.1)}
  g.restore();
  g.strokeStyle='rgba(20,12,6,.75)';g.lineWidth=1.3;body();g.stroke();
  // mang, mắt
  g.strokeStyle='rgba(20,12,6,.4)';g.lineWidth=1;g.beginPath();g.arc(len*0.3,0,h*0.42,-1.2,1.2);g.stroke();
  g.fillStyle='#fff';g.beginPath();g.arc(len*0.38,-h*0.15,Math.max(1.6,len*0.035),0,TAU);g.fill();g.fillStyle='#111';g.beginPath();g.arc(len*0.39,-h*0.15,Math.max(1,len*0.02),0,TAU);g.fill();
  // vây ngực
  g.fillStyle=fin;g.globalAlpha=0.8;g.beginPath();g.moveTo(len*0.22,h*0.15);g.quadraticCurveTo(len*0.08,h*0.5,len*0.04,h*0.25);g.closePath();g.fill();g.globalAlpha=1;
  if(f.pat==='cat'||f.pat==='dragon'){g.strokeStyle=f.pat==='dragon'?'#ffd23a':'#2a2420';g.lineWidth=1.2;g.beginPath();g.moveTo(len*0.48,h*0.05);g.quadraticCurveTo(len*0.62,h*0.3,len*0.58,h*0.6);g.moveTo(len*0.47,-h*0.05);g.quadraticCurveTo(len*0.66,-h*0.1,len*0.7,h*0.2);g.stroke()}
  if(f.pat==='lip'){g.fillStyle='#d88a8a';g.beginPath();g.ellipse(len*0.49,h*0.04,len*0.05,h*0.14,0,0,TAU);g.fill()}
  if(f.pat==='dragon'){g.strokeStyle='#ffe08a';g.lineWidth=1.8;g.beginPath();g.moveTo(len*0.36,-h*0.5);g.quadraticCurveTo(len*0.3,-h*0.95,len*0.2,-h*1.05);g.moveTo(len*0.3,-h*0.48);g.quadraticCurveTo(len*0.22,-h*0.85,len*0.12,-h*0.95);g.stroke()}
  g.restore()}
const ICONS={};
function fishIcon(id,sil){const k=id+(sil?'s':'');if(ICONS[k])return ICONS[k];const c=document.createElement('canvas');c.width=160;c.height=80;const g=c.getContext('2d');
  const f=FISH_BY[id];if(!sil&&f.pat==='dragon'){const gr=g.createRadialGradient(80,40,4,80,40,60);gr.addColorStop(0,'rgba(255,210,90,.55)');gr.addColorStop(1,'rgba(255,210,90,0)');g.fillStyle=gr;g.fillRect(0,0,160,80)}
  drawFishG(g,f,86,40,118,0,sil);try{ICONS[k]=c.toDataURL()}catch(e){ICONS[k]=''}return ICONS[k]}
function fishOpen(){const s=S_();if(!s)return;
  if(s.cast>=CASTS){simple('BẾN CÂU','Hết mồi hôm nay',`<p class="nvP">Đã dùng hết ${CASTS} mồi câu hôm nay. Sáng mai bác Thương Nhân lại mang mồi tới.</p>`,'<button class="btn sec" data-a="codex">Ngư Phổ</button><button class="btn" data-a="close">Đóng</button>',{codex:()=>{ovClose();NV.hubView='fish';HUB.show('kyngo')}});return}
  const box=ovOpen('fish',`<div class="nvFish"><div class="hd"><h3>Bến Câu</h3><span id="nvBait"></span><button class="x" data-a="close" aria-label="Đóng">${X_SVG}</button></div>
    <div id="nvPlay"><div class="nvCvW" id="nvCvW"><canvas id="nvCv" aria-label="Mặt hồ"></canvas></div><div class="nvMsg" id="nvMsg"></div>
    <div id="nvPw"><div class="nvLbl"><span>Lực quăng</span><span>Quăng xa, cá hiếm hơn</span></div><div class="nvBar"><i class="pw" id="nvPwI"></i></div></div>
    <div id="nvTn" hidden><div class="nvLbl"><span>Độ căng dây</span><span>Giữ để kéo · thả để nới</span></div><div class="nvBar"><i class="z" id="nvZ"></i><i class="d"></i><i class="k" id="nvK"></i></div><div class="nvProg"><i id="nvPg"></i></div></div>
    <button class="btn nvBig" id="nvFBtn">Quăng cần</button></div><div id="nvRes" hidden></div></div>`);
  bindBtns(box,{close:ovClose});
  const btn=box.querySelector('#nvFBtn'),cw=box.querySelector('#nvCvW');
  for(const el of[btn,cw]){el.addEventListener('pointerdown',e=>{e.preventDefault();Audio_.unlock&&Audio_.unlock();try{el.setPointerCapture(e.pointerId)}catch(_){}fishPress(true)});
    const up=e=>{fishPress(false)};el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('lostpointercapture',up)}
  btn.addEventListener('click',e=>e.preventDefault());
  fishReset();setTimeout(()=>btn.focus({preventScroll:true}),30)}
function fishReset(){const s=S_();NV.F={ph:'aim',t:0,pw:0,hold:false,rip:[],sp:[],dip:0,kois:[{a:0,r:0.3,s:0.4},{a:2,r:0.22,s:-0.3}]};
  const box=dom().box,pl=box.querySelector('#nvPlay'),rs=box.querySelector('#nvRes');if(pl)pl.hidden=false;if(rs)rs.hidden=true;
  fishUI('Chạm hoặc nhấn Space để quăng cần','');sizeCv();fishTick(0)}
function sizeCv(){const c=document.getElementById('nvCv');if(!c)return;const d=Math.min(2,window.devicePixelRatio||1),w=c.clientWidth||340,h=c.clientHeight||230;
  if(c.width!==Math.round(w*d)||c.height!==Math.round(h*d)){c.width=Math.round(w*d);c.height=Math.round(h*d);NV.bg=null}NV.cv={c,g:c.getContext('2d'),w,h,d}}
function fishUI(msg,cls){const F=NV.F,s=S_();const m=document.getElementById('nvMsg');if(m&&msg!=null){m.textContent=msg;m.className='nvMsg '+(cls||'')}
  const b=document.getElementById('nvBait');if(b)b.textContent=`Mồi ${CASTS-s.cast}/${CASTS}`;
  const btn=document.getElementById('nvFBtn');if(btn&&F)btn.textContent={aim:'Quăng cần',fly:'...',wait:'Chờ phao chìm...',bite:'GIẬT!',reel:'Giữ để kéo'}[F.ph]||'';
  const pw=document.getElementById('nvPw'),tn=document.getElementById('nvTn');if(pw&&F){pw.hidden=F.ph!=='aim';tn.hidden=F.ph!=='reel'}}
function rollFish(pw){if(NV.forceFish&&FISH_BY[NV.forceFish])return FISH_BY[NV.forceFish];let tot=0;const ws=FISH.map(f=>{let w=f.w*(f.r>=2?1+pw*0.9:1)*(f.r===4&&Lv()<8?0.3:1);tot+=w;return w});
  let r=Math.random()*tot;for(let i=0;i<FISH.length;i++){r-=ws[i];if(r<=0)return FISH[i]}return FISH[0]}
function fishPress(down){const F=NV.F;if(!F||NV.ov!=='fish')return;const s=S_();
  if(F.ph==='aim'&&down){if(s.cast>=CASTS){fishOpen();return}s.cast++;F.ph='fly';F.ft=0;F.fish=rollFish(F.pw);F.tx=0.42+0.48*F.pw;Audio_.play('swing');fishUI('','');return}
  if(F.ph==='wait'&&down){fishFail('Giật sớm quá, cá hoảng sợ bỏ đi.');return}
  if(F.ph==='bite'&&down){const r=F.fish.r;F.ph='reel';F.hold=true;F.ten=0.5;F.p=0;F.rt=0;F.snapT=0;F.slackT=0;F.zw=ZONE_W[r];F.zs=ZONE_S[r];F.ph1=Math.random()*6;F.ph2=Math.random()*6;F.jerkT=0.6;F.z=0.5;
    Audio_.play('hit');fishUI('Cá mắc câu! Giữ kim trắng trong vùng xanh','hot');return}
  if(F.ph==='reel')F.hold=!!down}
function fishFail(msg){const F=NV.F;F.ph='res';Audio_.play('fail');F.rip.push({x:F.bx,y:F.by,r:4,a:1});
  showRes(`<div class="nvCatch"><p style="font:700 16px var(--f-ui);color:#ff9a7a;margin:14px 0 6px">${esc(msg)}</p><p>Bí quyết: phao chìm hẳn mới giật; khi kéo, giữ kim trắng nằm trong vùng xanh.</p></div>`)}
function showRes(html){const s=S_(),box=dom().box,pl=box.querySelector('#nvPlay'),rs=box.querySelector('#nvRes');if(!rs)return;pl.hidden=true;rs.hidden=false;
  const more=CASTS-s.cast;rs.innerHTML=html+`<div class="nvRow" style="justify-content:center">${more>0?`<button class="btn" data-a="again">Câu tiếp (còn ${more} mồi)</button>`:''}<button class="btn sec" data-a="close">Xong</button></div>`;
  bindBtns(rs,{again:fishReset,close:ovClose});fishUI(null);const b=rs.querySelector('.btn');b&&setTimeout(()=>b.focus({preventScroll:true}),30)}
function fishCatch(){const F=NV.F,f=F.fish,s=S_();F.ph='res';const[a,b]=f.kg;const kg=Math.round((a+(b-a)*Math.pow(Math.random(),2.2))*100)/100;
  const val=Math.round(f.p*(1+Lv()/8)*clamp(kg/((a+b)/2),0.6,2.2));const bk=s.basket[f.id]||(s.basket[f.id]={n:0,v:0});bk.n++;bk.v+=val;
  const rc=s.rec[f.id]||(s.rec[f.id]={n:0,max:0,first:today()});rc.n++;const isRec=kg>rc.max&&rc.n>1;const first=rc.n===1;if(kg>rc.max)rc.max=kg;
  cnt('fish');bumpD('nvfish');let rw=null;
  if(f.r===4){rw={cq:200+5*Lv(),tq:2};give(rw,'nvfish');ofUnlock('nv_hoa_rong');G.flash={col:'#ffd23a',t:0.5,d:0.5}}
  else if(f.r===3&&first){rw={cq:60+2*Lv(),tq:1};give(rw,'nvfish')}
  if(FISH.every(x=>s.rec[x.id]))ofUnlock('nv_ngu_phu');
  Audio_.play('loot',Math.max(1,f.r+1));if(navigator.vibrate)try{navigator.vibrate(40)}catch(e){}
  F.last={id:f.id,kg,val};
  showRes(`<div class="nvCatch"><canvas id="nvFc" width="400" height="200"></canvas><h4 style="color:${RAR[f.r][1]}">${esc(f.nm)}</h4>
    <div class="w">${kg.toLocaleString('vi-VN')} kg · ${RAR[f.r][0]}${first?'<span class="rec">LOÀI MỚI</span>':isRec?'<span class="rec">KỶ LỤC</span>':''}</div><p>${esc(f.ds)}</p>
    <div class="nvRw"><span class="nvChip">Giá bán ${fmt(val)} vàng</span>${rw?chips(rw):''}</div></div>`);
  const c=document.getElementById('nvFc');if(c){const g=c.getContext('2d');if(f.r>=3){const gr=g.createRadialGradient(200,100,10,200,100,140);gr.addColorStop(0,f.r===4?'rgba(255,200,80,.6)':'rgba(255,220,140,.35)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,400,200)}drawFishG(g,f,210,100,300,0,false)}
  saveGame()}
function fishBg(){const V=NV.cv;if(NV.bg&&NV.bg.w===V.c.width)return NV.bg;const c=document.createElement('canvas');c.width=V.c.width;c.height=V.c.height;const g=c.getContext('2d'),w=V.w,h=V.h;g.scale(V.d,V.d);
  const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#2e5a3a');gr.addColorStop(0.16,'#3b7a7a');gr.addColorStop(1,'#163c46');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle='#2a4a24';g.beginPath();g.moveTo(0,0);g.lineTo(w,0);g.lineTo(w,22);for(let x=w;x>=0;x-=18)g.lineTo(x,22+Math.sin(x*0.13)*5);g.closePath();g.fill();
  g.strokeStyle='#4a7a34';g.lineWidth=1.4;for(let x=6;x<w;x+=11){g.beginPath();g.moveTo(x,26);g.quadraticCurveTo(x+3,10,x+(x%3)-1,2+(x*7%9));g.stroke()}
  g.strokeStyle='rgba(255,255,255,.07)';g.lineWidth=2;for(let i=0;i<14;i++){const y=40+i*13,x=(i*67)%w;g.beginPath();g.moveTo(x,y);g.lineTo(x+40+(i%3)*14,y);g.stroke()}
  const R=mulberry32(7);for(let i=0;i<9;i++){const x=R()*w,y=34+R()*(h-90),r=10+R()*12;if(x>w*0.38&&x<w*0.95&&y>h*0.38&&y<h*0.75)continue;
    g.fillStyle='#3f7a34';g.beginPath();g.ellipse(x,y,r,r*0.55,0,0.25,TAU-0.1);g.lineTo(x,y);g.closePath();g.fill();g.strokeStyle='#2a5a24';g.lineWidth=1;g.stroke();
    if(i%3===0){g.fillStyle='#f4a8c0';g.beginPath();g.ellipse(x+3,y-6,4,6,0,0,TAU);g.fill();g.fillStyle='#ff7aa0';g.beginPath();g.ellipse(x+3,y-5,2,4,0,0,TAU);g.fill()}}
  g.fillStyle='#6a4426';g.beginPath();g.moveTo(0,h);g.lineTo(0,h-34);g.lineTo(w*0.2,h-22);g.lineTo(w*0.24,h);g.closePath();g.fill();g.strokeStyle='#3a2414';g.lineWidth=1;for(let i=0;i<5;i++){g.beginPath();g.moveTo(0,h-30+i*7);g.lineTo(w*0.21,h-20+i*5);g.stroke()}
  NV.bg={c,w:V.c.width};return NV.bg}
function fishTick(dt){const F=NV.F;if(!F)return;F.t+=dt;const V=NV.cv;if(!V||!V.c.isConnected)sizeCv();if(!NV.cv)return;const w=NV.cv.w,h=NV.cv.h;
  F.by=h*0.6;if(F.ph!=='aim'&&F.ph!=='fly')F.bx=w*F.tx;
  if(F.ph==='aim'){F.pw=0.5-0.5*Math.cos(F.t*2.4);const el=document.getElementById('nvPwI');if(el)el.style.transform=`scaleX(${F.pw.toFixed(3)})`}
  else if(F.ph==='fly'){F.ft+=dt;if(F.ft>=0.45){F.ph='wait';F.wt=0;F.waitT=rand(1.6,4.2);F.nib=[];const n=randi(0,2);for(let i=0;i<n;i++)F.nib.push(rand(0.5,F.waitT-0.4));F.rip.push({x:w*F.tx,y:F.by,r:3,a:1});Audio_.play('dash');fishUI('Đợi phao chìm hẳn rồi mới giật...','')}}
  else if(F.ph==='wait'){F.wt+=dt;for(let i=F.nib.length-1;i>=0;i--)if(F.wt>=F.nib[i]){F.nib.splice(i,1);F.dip=4;F.rip.push({x:F.bx,y:F.by,r:2,a:0.7})}
    if(F.wt>=F.waitT){F.ph='bite';F.bt=0;F.dip=12;F.rip.push({x:F.bx,y:F.by,r:3,a:1},{x:F.bx,y:F.by,r:9,a:0.8});Audio_.play('coin');fishUI('Phao chìm! GIẬT NGAY!','hot')}}
  else if(F.ph==='bite'){F.bt+=dt;F.dip=12;if(F.bt>(NV.biteW||BITE_W[F.fish.r]))fishFail('Chậm tay! Cá ăn mất mồi rồi.')}
  else if(F.ph==='reel'){F.rt+=dt;const r=F.fish.r;
    F.z=clamp(0.5+0.34*Math.sin(F.rt*F.zs*1.1+F.ph1)*Math.cos(F.rt*F.zs*0.37+F.ph2),F.zw/2,1-F.zw/2);
    F.ten+=(F.hold?0.95:-0.8)*dt;F.jerkT-=dt;if(F.jerkT<=0){F.jerkT=rand(0.45,1.1);F.ten+=(Math.random()<0.5?-1:1)*(0.05+0.025*r);F.rip.push({x:F.bx+rand(-14,14),y:F.by,r:3,a:0.6})}
    F.ten=clamp(F.ten,0,1);const inZ=Math.abs(F.ten-F.z)<=F.zw/2;F.p=clamp(F.p+(inZ?PROG[r]:-0.08)*dt,0,1);
    if(F.ten>=1){F.snapT+=dt;if(F.snapT>0.35){fishFail('Phựt! Dây câu đứt rồi.');return fishDraw()}}else F.snapT=Math.max(0,F.snapT-dt*2);
    if(F.ten<=0){F.slackT+=dt;if(F.slackT>1.3){fishFail('Dây chùng quá, cá giãy thoát.');return fishDraw()}}else F.slackT=0;
    if(F.rt>32){fishFail('Cá vùng vẫy quá lâu rồi thoát.');return fishDraw()}
    if(F.p>=1){fishCatch();return fishDraw()}
    const zl=document.getElementById('nvZ'),k=document.getElementById('nvK'),pg=document.getElementById('nvPg');
    if(zl){zl.style.left=((F.z-F.zw/2)*100).toFixed(2)+'%';zl.style.width=(F.zw*100).toFixed(2)+'%'}if(k)k.style.left=(F.ten*100).toFixed(2)+'%';if(pg)pg.style.transform=`scaleX(${F.p.toFixed(3)})`;
    if(Math.random()<dt*8)F.sp.push({x:F.bx+rand(-16,16),y:F.by,vx:rand(-40,40),vy:rand(-90,-40),l:0.5})}
  F.dip=Math.max(F.ph==='bite'?12:0,F.dip-dt*14);
  for(let i=F.rip.length-1;i>=0;i--){const q=F.rip[i];q.r+=dt*26;q.a-=dt*0.9;if(q.a<=0)F.rip.splice(i,1)}
  for(let i=F.sp.length-1;i>=0;i--){const q=F.sp[i];q.l-=dt;q.vy+=260*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.l<=0)F.sp.splice(i,1)}
  fishDraw()}
function fishDraw(){const F=NV.F,V=NV.cv;if(!F||!V)return;const g=V.g,w=V.w,h=V.h;g.setTransform(1,0,0,1,0,0);g.drawImage(fishBg().c,0,0);g.setTransform(V.d,0,0,V.d,0,0);
  // bóng cá chép cảnh bơi
  g.fillStyle='rgba(10,30,30,.28)';for(const k of F.kois){k.a+=0.016*k.s;const x=w*0.55+Math.cos(k.a)*w*k.r,y=h*0.5+Math.sin(k.a)*h*0.22;g.save();g.translate(x,y);g.rotate(k.a+(k.s>0?Math.PI/2:-Math.PI/2));g.beginPath();g.ellipse(0,0,12,4,0,0,TAU);g.fill();g.restore()}
  const tipX=w*0.33,tipBase=h*0.2,ten=F.ph==='reel'?F.ten:0;const tx=tipX+ten*14,ty=tipBase+ten*26;
  let bx,by;if(F.ph==='aim'){bx=tx+4;by=ty+40+Math.sin(F.t*3)*3}else if(F.ph==='fly'){const k=Math.min(1,F.ft/0.45);bx=lerp(tx,w*F.tx,k);by=lerp(ty,F.by,k)-Math.sin(k*Math.PI)*60}else{bx=F.bx+(F.ph==='reel'?Math.sin(F.rt*7)*8:0);by=F.by+F.dip*0.6}
  if(F.ph==='aim'){const ax=w*(0.42+0.48*F.pw);g.strokeStyle='rgba(255,230,150,.65)';g.setLineDash([4,5]);g.lineWidth=1.5;g.beginPath();g.ellipse(ax,F.by,13,5,0,0,TAU);g.stroke();g.setLineDash([])}
  for(const q of F.rip){g.strokeStyle=`rgba(230,250,250,${Math.max(0,q.a)*0.7})`;g.lineWidth=1.4;g.beginPath();g.ellipse(q.x,q.y+2,q.r,q.r*0.35,0,0,TAU);g.stroke()}
  if(F.ph==='reel'&&F.fish){g.save();g.globalAlpha=0.55;g.translate(bx+Math.sin(F.rt*5)*10,by+14);g.scale(Math.cos(F.rt*3)>0?1:-1,1);drawFishG(g,F.fish,0,0,44,F.rt*12,true);g.restore()}
  // cần câu
  g.strokeStyle='#4a2e18';g.lineWidth=5;g.beginPath();g.moveTo(w*0.04,h+4);g.quadraticCurveTo(w*0.16,h*0.42+ten*20,tx,ty);g.stroke();g.strokeStyle='#c8a060';g.lineWidth=2.6;g.stroke();
  // dây
  g.strokeStyle='rgba(245,245,235,.8)';g.lineWidth=1;g.beginPath();g.moveTo(tx,ty);g.quadraticCurveTo((tx+bx)/2,Math.max(ty,by)+(1-ten)*26-(F.ph==='reel'?10:0),bx,by-6);g.stroke();
  // phao
  const sub=F.ph==='bite'||F.ph==='reel';g.save();g.translate(bx,by);
  if(!sub||F.ph==='bite'&&Math.sin(F.t*20)>0.6){g.fillStyle='#fff6e8';g.beginPath();g.ellipse(0,0,4,5,0,0,Math.PI);g.fill();g.fillStyle='#e0402a';g.beginPath();g.ellipse(0,0,4,6,0,Math.PI,TAU);g.fill();g.strokeStyle='#2a1a10';g.lineWidth=1;g.beginPath();g.moveTo(0,-6);g.lineTo(0,-12);g.stroke()}
  g.restore();
  g.fillStyle='rgba(235,250,250,.85)';for(const q of F.sp){g.beginPath();g.arc(q.x,q.y,1.6,0,TAU);g.fill()}
  if(F.ph==='bite'){g.font='800 20px "Be Vietnam Pro",system-ui,sans-serif';g.textAlign='center';g.lineWidth=4;g.strokeStyle='rgba(40,10,0,.85)';g.strokeText('!',bx,by-24);g.fillStyle='#ffd23a';g.fillText('!',bx,by-24)}}

/* ================= ÁP TIÊU ================= */
const ESC_SPD=64,ESC_NEAR=330;
function escRw(hpR){const L=Lv(),k=0.5+hpR;return{gold:Math.round((60*L+300)*k),ore:Math.round((2+L/12)*k),cq:Math.round((20+2*L)*hpR),tq:hpR>=0.85?1:0,exp:Math.round(bonusExp(0.2*k))}}
function escOpen(){const s=S_();if(!s)return;const nm=esc(G.W.M.name);
  if(towerOn()){UI.toast('Đang Vượt Tháp, không nhận tiêu được.','warn');return}
  if(NV.Esc){UI.toast('Xe hàng đang trên đường. Theo mũi tên vàng!','warn');return}
  if(Lv()<ESC_LV){simple('TIÊU CỤC '+nm.toUpperCase(),'Chưa đủ bản lĩnh',`<p class="nvP">"Đường xa nhiều thảo khấu. Đạt cấp ${ESC_LV} rồi hãy tới nhận tiêu."</p>`,'<button class="btn" data-a="close">Đóng</button>');return}
  if(s.esc>=ESC_N){simple('TIÊU CỤC '+nm.toUpperCase(),'Hết chuyến hôm nay',`<p class="nvP">Hôm nay đã áp tiêu đủ ${ESC_N} chuyến. Ngày mai thương đội lại cần người.</p>`,'<button class="btn" data-a="close">Đóng</button>');return}
  const rw=escRw(1);
  simple('TIÊU CỤC '+nm.toUpperCase(),'Áp tiêu xe hàng',`<p class="nvP">Thương đội cần người hộ tống xe bò chở muối, vải và gạo tới <b>Trạm Dịch</b> theo đường mòn. Thảo khấu sẽ phục kích ba lần: xe dừng lại cho tới khi đẩy lui hết bọn cướp.</p>
    <p class="nvP">Xe chỉ lăn bánh khi tiêu sư đi gần. Xe còn càng lành lặn, thưởng càng hậu. Chuyến hôm nay: <b>${s.esc+1}/${ESC_N}</b>.</p><div class="nvRw">${chips(rw)}</div><p class="nvP" style="font-size:12.5px;color:#7a5a3a;margin-top:6px">Thưởng tối đa khi xe nguyên vẹn.</p>`,
    '<button class="btn sec" data-a="close">Để sau</button><button class="btn" data-a="go">Lên đường</button>',{go:()=>{ovClose();escStart()}})}
function escStart(){const s=S_(),W=G.W;if(!s||NV.Esc||s.esc>=ESC_N||towerOn())return false;const P=W.pathPts;
  let i0=0;while(i0<P.length-1&&dist(P[i0].x,P[i0].y,12.9*T,41*T)<1.2*T)i0++;
  let i1=Math.floor(P.length*(0.5+0.06*(s.esc%3)));while(i1>i0+10&&dist(P[i1].x,P[i1].y,W.arena.x,W.arena.y)<W.arena.r+3*T)i1--;
  const pts=P.slice(i0,i1+1),cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+dist(pts[i-1].x,pts[i-1].y,pts[i].x,pts[i].y));
  s.esc++;cnt('escTry');
  NV.Esc={pts,cum,len:cum[cum.length-1],d:0,x:pts[0].x,y:pts[0].y,f:1,hp:100,max:100,waves:[0.22,0.5,0.8],wi:0,wave:null,wa:0,walk:0,t:0,hurt:0,trk:0,mv:false,mi:W.mi};
  NV.guide=null;UI.toast('Lên đường! Đi sát xe hàng để xe lăn bánh.','quest');Audio_.play('quest');G.dirty.quest=1;saveGame();return true}
function escPos(E){let i=1;while(i<E.cum.length-1&&E.cum[i]<E.d)i++;const a=E.pts[i-1],b=E.pts[i],seg=E.cum[i]-E.cum[i-1]||1,k=clamp((E.d-E.cum[i-1])/seg,0,1);
  E.x=lerp(a.x,b.x,k);E.y=lerp(a.y,b.y,k);if(Math.abs(b.x-a.x)>2)E.f=b.x>a.x?1:-1}
function escWave(E){const W=G.W,n=3+E.wi+(Lv()>=10?1:0),ang=E.f>0?0:Math.PI,made=[];
  for(let k=0,tries=0;k<n&&tries<120;tries++){const a=ang+rand(-1.6,1.6),r=rand(170,290),x=E.x+Math.cos(a)*r,y=E.y+Math.sin(a)*r*0.85;const tx=Math.floor(x/T),ty=Math.floor(y/T);
    if(tx<1||ty<1||tx>=MW-1||ty>=MH-1||!W.walkLocked[ty*MW+tx]||inTownPt(x,y))continue;
    const e=spawnEnemy(pickType(),x,y,enemyLevelAt(x,y),E.wi===E.waves.length-1&&k===0);e.nvEsc=1;
    if(k%2===0){e.state='nvraid';e.nvRaid=1;e.nvT=rand(0.4,0.9)}else e.state='chase';
    for(let j=0;j<6;j++)addPart(x,y-10,rand(-60,60),rand(-90,-20),0.5,'#c8a868',3,100);made.push(e);k++}
  E.wave=made;E.wi++;cnt('escWave');UI.toast(`Thảo khấu phục kích (đợt ${E.wi}/${E.waves.length})! Bảo vệ xe hàng!`,'boss');Audio_.play('roar');G.shake=Math.max(G.shake,6)}
function escTick(dt){const E=NV.Esc;if(!E||G.state!=='play')return;const p=G.p;E.t+=dt;E.hurt=Math.max(0,E.hurt-dt);
  if(G.W.mi!==E.mi){escEnd(false,'',true);return}
  if(E.wave){E.wave=E.wave.filter(e=>!e.dead&&G.enemies.includes(e));if(!E.wave.length){E.wave=null;UI.toast('Đã đẩy lui toán cướp. Xe tiếp tục lên đường!','quest');Audio_.play('quest')}}
  const near=dist(p.x,p.y,E.x,E.y)<ESC_NEAR;E.mv=near&&!E.wave;
  if(E.mv){E.d=Math.min(E.len,E.d+ESC_SPD*dt);escPos(E);E.wa+=ESC_SPD*dt/18;E.walk+=dt*5}
  if(!E.wave&&E.wi<E.waves.length&&E.d/E.len>=E.waves[E.wi])escWave(E);
  E.trk+=dt;if(E.trk>0.5){E.trk=0;G.dirty.quest=1}
  if(E.hp<=0){escEnd(false,'Xe hàng bị thảo khấu phá tan tành!');return}
  if(E.d>=E.len&&!E.wave)escEnd(true)}
function escRaid(dt){const E=NV.Esc;if(!E||!E.wave)return;for(const e of E.wave){if(e.dead||!e.nvRaid||e.state!=='nvraid')continue;if(e.stun>0||e.hitstun>0)continue;
  const dx=E.x-e.x,dy=E.y-e.y,d=Math.hypot(dx,dy)||1;e.f=dx>=0?1:-1;
  if(d>e.r+46){stepEnemy(e,dx/d,dy/d,1.05,dt);if(e.state==='idle'){e.state='nvraid'}e.walk+=dt*10;e.moving=true}
  else{e.nvT-=dt;if(e.nvT<=0){e.nvT=rand(1.0,1.3);e.atkAnim=0;const dm=e.elite?7:e.def.ai==='charge'?5:4;E.hp=Math.max(0,E.hp-dm);E.hurt=0.25;
    G.fx.push({k:'slash',x:e.x,y:e.y-14,a:Math.atan2(dy,dx),arc:1.6,r:40,life:0.15,max:0.15,col:'#ff8a6a',enemy:1});addFloat(E.x+rand(-20,20),E.y-80,'-'+dm,'#ffb347',15);Audio_.play('hit')}}}}
function escEnd(win,why,silent){const E=NV.Esc;if(!E)return;NV.Esc=null;if(E.wave)for(const e of E.wave)if(!e.dead&&e.state==='nvraid')e.state='chase';G.dirty.quest=1;
  if(silent){UI.toast('Chuyến tiêu bị hủy giữa đường.','warn');return}
  if(win){const hpR=E.hp/E.max,rw=escRw(hpR);give(rw,'nvesc');cnt('escOk');bumpD('nvesc');Audio_.play('win');
    G.fx.push({k:'pillar',x:E.x,y:E.y,w:30,h:300,col:'#ffd23a',life:1.2,max:1.2},{k:'ring',x:E.x,y:E.y,r:10,r2:140,life:0.6,max:0.6,col:'#ffd23a'});
    for(let i=0;i<30;i++){const a=i/30*TAU;addPart(E.x+Math.cos(a)*20,E.y-30,Math.cos(a)*160,Math.sin(a)*90-60,0.9,i%2?'#ffd23a':'#ff6a3a',3,100)}
    saveGame();G.timers.push({t:0.7,fn:()=>{if(G.state!=='play')return;simple('ÁP TIÊU · TRẠM DỊCH','Giao hàng thành công',`<p class="nvP">Xe hàng tới nơi, còn <b>${Math.round(hpR*100)}%</b> nguyên vẹn. ${hpR>=0.85?'Chủ hàng mừng rỡ, thưởng thêm Tàn Quyển.':hpR>=0.5?'Hàng hư hao chút ít.':'Hàng hư hại khá nhiều, chủ hàng tiếc lắm.'}</p><div class="nvRw">${chips(rw)}</div>`,'<button class="btn" data-a="close">Nhận thưởng</button>')}})}
  else{Audio_.play('fail');cnt('escFail');for(let i=0;i<24;i++)addPart(E.x+rand(-40,40),E.y-30,rand(-160,160),rand(-200,-40),0.9,i%2?'#8a5a32':'#c09050',rand(3,6),500);G.shake=8;
    saveGame();if(G.state==='play')G.timers.push({t:0.5,fn:()=>{if(G.state!=='play')return;simple('ÁP TIÊU','Mất hàng',`<p class="nvP">${esc(why||'Chuyến tiêu thất bại.')}</p><p class="nvP">Hôm nay còn ${ESC_N-S_().esc} chuyến. Lần sau hãy diệt bọn cướp đang phá xe trước.</p>`,'<button class="btn" data-a="close">Đóng</button>')}});else UI.toast(why,'warn')}}
function drawEsc(){const E=NV.Esc;if(!E)return;const end=E.pts[E.pts.length-1];
  if(inView(end.x,end.y,120)){const g=cx;g.save();g.strokeStyle=`rgba(255,215,90,${0.5+Math.sin(G.t*3)*0.25})`;g.lineWidth=3;g.beginPath();g.ellipse(end.x,end.y,46,18,0,0,TAU);g.stroke();
    g.strokeStyle='#3a2414';g.lineWidth=3;g.beginPath();g.moveTo(end.x+20,end.y);g.lineTo(end.x+20,end.y-96);g.stroke();
    const fl=Math.sin(G.t*4)*3;g.fillStyle='#e2b24a';g.strokeStyle='#7a1f14';g.lineWidth=1.4;g.beginPath();g.moveTo(end.x+21,end.y-94);g.lineTo(end.x+52,end.y-88+fl);g.lineTo(end.x+50,end.y-70+fl);g.lineTo(end.x+21,end.y-72);g.closePath();g.fill();g.stroke();
    g.fillStyle='#7a1f14';g.font='800 9px "Be Vietnam Pro",system-ui,sans-serif';g.textAlign='center';g.fillText('TRẠM',end.x+36,end.y-80+fl*0.7);label({x:end.x,y:end.y},'Trạm Dịch','#ffe2a0',104);g.restore()}
  if(!inView(E.x,E.y,160))return;drawCart(cx,E.x,E.y,E.f,{mv:E.mv,walk:E.walk,wa:E.wa,t:G.t,hurt:E.hurt});
  const g=cx,w=64,y=E.y-112;g.fillStyle='rgba(20,10,5,.8)';g.fillRect(E.x-w/2-1,y-1,w+2,8);const r=E.hp/E.max;g.fillStyle=r>0.5?'#5fd06a':r>0.25?'#ffb32a':'#d93a2a';g.fillRect(E.x-w/2,y,w*r,6);
  g.font='700 11px "Be Vietnam Pro",system-ui,sans-serif';g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(20,10,5,.85)';const t=E.wave?'Bị cướp!':E.mv?'Xe hàng':'Đợi tiêu sư';g.strokeText(t,E.x,y-5);g.fillStyle=E.wave?'#ff8a6a':'#ffe2a0';g.fillText(t,E.x,y-5)}
function drawEscArrow(){const E=NV.Esc;if(!E||G.state!=='play')return;const end=E.pts[E.pts.length-1];const[sx,sy]=worldToScreen(end.x,end.y),m=50;if(sx>m&&sx<VW-m&&sy>m&&sy<VH-m)return;
  const a=Math.atan2(sy-VH/2,sx-VW/2),r=Math.min(VW,VH)*0.32;const ax=clamp(VW/2+Math.cos(a)*r*1.25,36,VW-36),ay=clamp(VH/2+Math.sin(a)*r,100,VH-160);
  cx.setTransform(DPR,0,0,DPR,0,0);cx.translate(ax,ay);cx.rotate(a);cx.globalAlpha=0.9;cx.fillStyle='#5fd06a';cx.strokeStyle='rgba(10,30,10,.85)';cx.lineWidth=2;cx.beginPath();cx.moveTo(15,0);cx.lineTo(-7,-10);cx.lineTo(-3,0);cx.lineTo(-7,10);cx.closePath();cx.fill();cx.stroke();cx.globalAlpha=1;cx.setTransform(1,0,0,1,0,0)}

/* ================= CHÌA KHÓA & RƯƠNG BÍ ẨN ================= */
function chestOpen(n){const s=S_(),mi=G.W.mi,key=mi+'-'+n.k;
  if(s.chest[key]===today()){UI.toast('Rương đã mở hôm nay. Ngày mai lại có báu vật mới.','warn');return false}
  if(s.keys<=0){UI.toast('Cần Chìa Khóa Đồng. Chìa rơi từ quái tinh anh và boss.','warn');return false}
  s.keys--;s.chest[key]=today();const first=!s.chestEver[key];s.chestEver[key]=1;
  try{openChest({x:n.x,y:n.y+10,val:{bonus:1.6,why:'Rương Bí Ẩn'}})}catch(e){console.error(e)}
  const rw={cq:15+Lv(),tq:first?1:0};const t=give(rw,'nvchest');if(first)UI.toast('Lần đầu mở rương này: '+t,'quest');cnt('chest');
  G.fx.push({k:'pillar',x:n.x,y:n.y,w:24,h:220,col:'#ffd23a',life:0.9,max:0.9});G.dirty.quest=1;saveGame();return true}
HK.on('kill',e=>{if(!G.save||towerOn()||!e)return;if(e.boss||(e.elite&&Math.random()<(NV.keyRate!=null?NV.keyRate:KEY_ELITE))){dropAt(e.x,e.y,'nvkey',1)}});
function claimKeys(){const p=G.p,s=S_();if(!p||!s)return;for(let i=G.drops.length-1;i>=0;i--){const d=G.drops[i];if(d.kind!=='nvkey')continue;
  if(dist(d.x,d.y,p.x,p.y)<34){G.drops.splice(i,1);s.keys++;UI.loot('+1 Chìa Khóa Đồng','#ffd23a');Audio_.play('loot',2);if(s.keys===1&&!s.cnt.keyTip){s.cnt.keyTip=1;UI.toast('Chìa Khóa Đồng mở được Rương Bí Ẩn giấu trong chương. Xem thẻ Kỳ Ngộ (Võ Đạo).','quest')}}}}
const _ud=updateDrops;updateDrops=function(){try{claimKeys()}catch(e){console.error(e)}return _ud.apply(this,arguments)};
const _ue=updateEnemies;updateEnemies=function(dt){const r=_ue.apply(this,arguments);try{escRaid(dt)}catch(e){console.error(e)}return r};

/* ================= CHỈ ĐƯỜNG ================= */
function targets(kind){const W=G.W,s=S_(),mi=W.mi,p=G.p;const L=W.npcs.filter(n=>n.nv===kind);
  if(kind==='bia')return L.filter(n=>!s.bia[mi+'-'+n.k]);if(kind==='chest')return L.filter(n=>s.chest[mi+'-'+n.k]!==today());return L}
function guide(kind){const p=G.p;let L=targets(kind);if(!L.length){UI.toast(kind==='bia'?'Đã đọc hết bia đá chương này.':kind==='chest'?'Rương chương này đã mở hết hôm nay.':'Không tìm thấy.','warn');return false}
  L.sort((a,b)=>dist2(a.x,a.y,p.x,p.y)-dist2(b.x,b.y,p.x,p.y));const n=L[0];
  NV.guide={x:n.x,y:n.y+20,label:n.name,mi:G.W.mi,kind};if(UI.panel)UI.close();UI.toast('Theo mũi tên vàng tới '+n.name,'quest');G.dirty.quest=1;return true}
const _qt=questTarget;questTarget=function(){try{if(!towerOn()&&G.W){const E=NV.Esc;if(E)return{x:E.x+E.f*60,y:E.y,label:'Xe hàng'};const g=NV.guide;if(g&&g.mi===G.W.mi)return{x:g.x,y:g.y,label:g.label}}}catch(e){}return _qt.apply(this,arguments)};
function guideTick(){const g=NV.guide,p=G.p;if(!g||!p)return;if(!G.W||g.mi!==G.W.mi){NV.guide=null;G.dirty.quest=1;return}if(dist(p.x,p.y,g.x,g.y)<70){NV.guide=null;G.dirty.quest=1}}
HK.on('tick',dt=>{if(!G.save)return;try{escTick(dt);guideTick()}catch(e){console.error(e)}});
HK.on('drawWorld',()=>{if(!G.save||!G.W)return;try{
  for(const d of G.drops)if(d.kind==='nvkey'&&inView(d.x,d.y,40))drawKey(d.x,d.y-d.z+(d.z>0?0:Math.sin(G.t*3+d.id*10)*2));
  drawEsc();const g=NV.guide;if(g&&g.mi===G.W.mi&&inView(g.x,g.y,60)){cx.save();cx.strokeStyle=`rgba(255,210,58,${0.45+Math.sin(G.t*4)*0.25})`;cx.lineWidth=2.5;const r=26+Math.sin(G.t*4)*4;cx.beginPath();cx.ellipse(g.x,g.y,r,r*0.4,0,0,TAU);cx.stroke();cx.restore()}
}catch(e){console.error(e)}});
HK.on('drawScreen',()=>{try{drawEscArrow()}catch(e){console.error(e)}});
const _rt=UI.renderTracker;UI.renderTracker=function(){const r=_rt.apply(this,arguments);try{const q=document.getElementById('qt');if(!q)return r;let h='';const E=NV.Esc;
  if(E)h=`Áp Tiêu · xe ${Math.round(E.hp/E.max*100)}% · đường ${Math.round(E.d/E.len*100)}%${E.wave?' · <b style="color:#ff8a6a">Cướp!</b>':E.mv?'':' · đợi tiêu sư'}`;
  else if(NV.guide&&G.W&&NV.guide.mi===G.W.mi)h='Kỳ Ngộ: tới '+esc(NV.guide.label);
  if(h){const d=document.createElement('div');d.className='nvTrk';d.innerHTML=h;q.appendChild(d)}}catch(e){console.error(e)}return r};

/* ================= THẺ KỲ NGỘ (Võ Đạo) ================= */
const IC={
  quiz:'<svg viewBox="0 0 24 24" fill="none" stroke="#ffd98a" stroke-width="1.7" stroke-linejoin="round"><path d="M5 4h12a2 2 0 012 2v12H7a2 2 0 01-2-2z"/><path d="M5 16a2 2 0 002 2"/><path d="M9 8h6M9 11h6M9 14h3"/></svg>',
  fish:'<svg viewBox="0 0 24 24" fill="none" stroke="#ffd98a" stroke-width="1.7" stroke-linejoin="round"><path d="M3 12c3-5 9-6 13-2l4-3v10l-4-3c-4 4-10 3-13-2z"/><circle cx="7.5" cy="11" r=".9" fill="#ffd98a"/></svg>',
  cart:'<svg viewBox="0 0 24 24" fill="none" stroke="#ffd98a" stroke-width="1.7" stroke-linejoin="round"><path d="M2 8h12v7H2z"/><path d="M14 11h4l3 3"/><circle cx="6" cy="17" r="2.6"/><path d="M6 14.4v5.2M3.4 17h5.2"/></svg>',
  chest:'<svg viewBox="0 0 24 24" fill="none" stroke="#ffd98a" stroke-width="1.7" stroke-linejoin="round"><path d="M3 10h18v9H3z"/><path d="M3 10c0-4 3-5 9-5s9 1 9 5"/><rect x="10" y="11" width="4" height="4" rx="1"/></svg>',
};
function hubAct(){const s=S_(),W=G.W,mi=W.mi;const bias=W.npcs.filter(n=>n.nv==='bia'),chs=W.npcs.filter(n=>n.nv==='chest');
  const biaRead=bias.filter(n=>s.bia[mi+'-'+n.k]).length,chOpen=chs.filter(n=>s.chest[mi+'-'+n.k]===today()).length;const ord=s.ord,of=FISH_BY[ord.sp],have=(s.basket[ord.sp]||{n:0}).n;
  const pill=(t,done)=>`<span class="${done?'done':''}">${t}</span>`;const E=NV.Esc;
  return`<div class="nvCard"><div class="ic">${IC.quiz}</div><div><h5>Đố Sử Việt</h5><p>Ông Đồ ngồi cạnh Dịch Trạm ra 5 câu sử mỗi ngày. Bia Đá ven đường mòn mỗi chương giữ một trang Sử Ký.</p>
    <div class="nvPills">${pill(`Hôm nay ${s.qz}/${QUIZ_N} câu · đúng ${s.qc}`,s.qz>=QUIZ_N)}${pill(`Bia chương này ${biaRead}/${bias.length}`,biaRead>=bias.length)}</div>
    <div class="nvBtns"><button class="btn sm" data-go="ongdo">Tới Ông Đồ</button><button class="btn sec sm" data-go="bia" ${biaRead>=bias.length?'disabled':''}>Tới Bia Đá</button></div></div></div>
  <div class="nvCard"><div class="ic">${IC.fish}</div><div><h5>Câu Cá</h5><p>Bến câu ở bờ nam hồ sen. Phao chìm hẳn mới giật, rồi giữ dây trong vùng xanh.</p>
    <div class="nvPills">${pill(`Mồi ${CASTS-s.cast}/${CASTS}`,s.cast>=CASTS)}${pill(`Đơn hàng: ${ord.n} ${of.nm}${ord.done?' · đã giao':` (${Math.min(have,ord.n)}/${ord.n})`}`,ord.done)}</div>
    <div class="nvBtns"><button class="btn sm" data-go="fish">Tới bến câu</button><button class="btn sec sm" data-v="fish">Giỏ cá & Ngư Phổ</button></div></div></div>
  <div class="nvCard"><div class="ic">${IC.cart}</div><div><h5>Áp Tiêu</h5><p>Tiêu Đầu đứng ngoài cổng bắc. Hộ tống xe bò tới Trạm Dịch, thưởng theo độ nguyên vẹn của xe.${Lv()<ESC_LV?` Mở ở cấp ${ESC_LV}.`:''}</p>
    <div class="nvPills">${pill(E?`Đang áp tiêu · xe ${Math.round(E.hp)}%`:`Hôm nay ${s.esc}/${ESC_N} chuyến`,s.esc>=ESC_N&&!E)}</div>
    <div class="nvBtns"><button class="btn sm" data-go="tieu" ${E?'disabled':''}>Tới Tiêu Đầu</button></div></div></div>
  <div class="nvCard"><div class="ic">${IC.chest}</div><div><h5>Rương Bí Ẩn</h5><p>Chìa Khóa Đồng rơi từ quái tinh anh và boss. Mỗi chương giấu ${chs.length} rương khóa ở chỗ khuất, mở lại được mỗi ngày.</p>
    <div class="nvPills">${pill(`Chìa khóa: ${s.keys}`,false)}${pill(`Rương chương này ${chOpen}/${chs.length} đã mở`,chOpen>=chs.length)}</div>
    <div class="nvBtns"><button class="btn sm" data-go="chest" ${chOpen>=chs.length?'disabled':''}>Tới rương gần nhất</button></div></div></div>`}
function hubFish(){const s=S_(),ord=s.ord,of=FISH_BY[ord.sp],have=(s.basket[ord.sp]||{n:0}).n;let tot=0,totN=0;
  const rows=FISH.filter(f=>s.basket[f.id]&&s.basket[f.id].n>0).map(f=>{const b=s.basket[f.id];tot+=b.v;totN+=b.n;return`<div class="nvBk"><img src="${fishIcon(f.id)}" alt=""><span class="nm" style="color:${RAR[f.r][1]}">${esc(f.nm)} ×${b.n}</span><button class="btn sec sm" data-sell="${f.id}">Bán ${fmt(b.v)}</button></div>`}).join('');
  const caught=FISH.filter(f=>s.rec[f.id]).length;
  return`<div class="sec"><h4>GIỎ CÁ</h4>${rows||'<p class="hist" style="color:var(--dim);font:500 13px var(--f-ui)">Giỏ còn trống. Ra bến câu thử vận may.</p>'}
    ${totN?`<div class="nvBtns"><button class="btn sm" data-sell="all">Bán hết (${fmt(tot)} vàng)</button></div>`:''}</div>
    <div class="sec"><h4>ĐƠN HÀNG HÔM NAY</h4><div class="nvBk"><img src="${fishIcon(of.id)}" alt=""><span class="nm">Quán Thủy Tạ cần ${ord.n} ${esc(of.nm)} (${Math.min(have,ord.n)}/${ord.n})</span>
    <button class="btn sm" data-ord="1" ${ord.done||have<ord.n?'disabled':''}>${ord.done?'Đã giao':'Giao hàng'}</button></div><div class="nvRw">${chips(ordRw())}</div></div>
    <div class="sec"><h4>NGƯ PHỔ · ${caught}/${FISH.length} LOÀI</h4><div class="nvCodex">${FISH.map(f=>{const r=s.rec[f.id];return`<div class="nvFc"><img src="${fishIcon(f.id,!r)}" alt=""><b style="color:${r?RAR[f.r][1]:'var(--dim)'}">${r?esc(f.nm):'???'}</b><span>${RAR[f.r][0]}${r?` · ${r.n} con`:''}</span><span>${r?'Kỷ lục '+r.max.toLocaleString('vi-VN')+' kg':'Chưa câu được'}</span></div>`}).join('')}</div></div>`}
function hubSu(){const s=S_();const n=Object.keys(s.bia).length;const c=s.cnt;
  let h=`<div class="nvPills" style="margin-bottom:10px"><span>Sử Ký ${n}/${BIA.length*2} trang</span><span>Đố đúng tổng ${c.quizOk||0}/${c.quiz||0} câu</span></div>`;
  BIA.forEach((pair,mi)=>{pair.forEach((B,k)=>{const got=s.bia[mi+'-'+k];h+=got?`<div class="nvSu"><h6>Chương ${mi+1} · ${esc(MAPS[mi].name)} · ${esc(B[0])}</h6><p>${esc(B[1])}</p></div>`:`<div class="nvSu lk"><h6>Chương ${mi+1} · ${esc(MAPS[mi].name)} · ???</h6><p>Tìm Bia Đá ven đường mòn chương này để mở trang.</p></div>`})});
  return h}
function ordRw(){return{cq:30+2*Lv(),ore:3+Math.floor(Lv()/20),gold:10*Lv()+80}}
function sell(id){const s=S_();let v=0,n=0;for(const f of FISH){if(id!=='all'&&f.id!==id)continue;const b=s.basket[f.id];if(!b||!b.n)continue;v+=b.v;n+=b.n;delete s.basket[f.id]}
  if(!n)return 0;giveRes('gold',v,'nvfish');Audio_.play('coin');UI.toast(`Bán ${n} con cá: +${fmt(v)} vàng`);G.dirty.res=1;saveGame();return v}
function turnIn(){const s=S_(),o=s.ord,b=s.basket[o.sp];if(o.done||!b||b.n<o.n)return false;const part=Math.round(b.v*o.n/b.n);b.n-=o.n;b.v-=part;if(b.n<=0)delete s.basket[o.sp];o.done=1;
  const t=give(ordRw(),'nvorder');UI.toast('Giao đơn cá cho Quán Thủy Tạ: '+t,'quest');Audio_.play('quest');cnt('order');saveGame();return true}
const HUBTAB={id:'kyngo',name:'Kỳ Ngộ',order:46,
  html(){if(!G.save||!G.W)return'';dom();const v=NV.hubView;const seg=[['act','Hôm nay'],['fish','Ngư Phổ'],['su','Sử Ký']].map(([k,l])=>`<button data-v="${k}" aria-pressed="${v===k}">${l}</button>`).join('');
    return`<div class="nvSegs" role="tablist">${seg}</div>`+(v==='fish'?hubFish():v==='su'?hubSu():hubAct())},
  bind(body){body.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{NV.hubView=b.dataset.v;Audio_.play('ui');HUB.refresh()});
    body.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{Audio_.play('ui');guide(b.dataset.go)});
    body.querySelectorAll('[data-sell]').forEach(b=>b.onclick=()=>{sell(b.dataset.sell);HUB.refresh()});
    body.querySelectorAll('[data-ord]').forEach(b=>b.onclick=()=>{turnIn();HUB.refresh()})},
  dot(){if(!G.save)return false;const s=S_();if(s.qz<QUIZ_N)return true;if(s.keys>0&&G.W&&targets('chest').length)return true;return false}};
if(window.HUB&&HUB.add)HUB.add(HUBTAB);

/* ================= HOẠT ĐỘNG NGÀY (daily.js) ================= */
(function(){if(!window.DAILY||!DAILY.QD)return;const Q=DAILY.QD;
  if(!Q.nvquiz)Q.nvquiz={nm:n=>`Trả lời đúng ${n} câu Đố Sử Việt`,n:()=>3,w:2,wn:()=>15};
  if(!Q.nvfish)Q.nvfish={nm:n=>`Câu được ${n} con cá`,n:()=>3,w:2,wn:()=>20};
  if(!Q.nvesc)Q.nvesc={nm:n=>`Áp tiêu ${n} chuyến thành công`,n:()=>1,ok:L=>L>=ESC_LV,w:2,wn:()=>6}})();

/* ================= BỌC GIAO DIỆN & VÒNG ĐỜI ================= */
const ACT_LBL={ongdo:'Đố Sử Việt',fish:'Câu cá',tieu:'Áp tiêu',bia:'Đọc bia',chest:'Mở rương'};
const _np=UI.npcPrompt;UI.npcPrompt=function(n){const r=_np.apply(this,arguments);if(n&&n.nv){const b=document.getElementById('npcBtn');if(b)b.textContent=`${n.name}: ${ACT_LBL[n.nv]}${FINE?' (E)':''}`}return r};
function act(k,n){if(G.state!=='play'||NV.ov)return;n=n||G.nearNpc;
  if(k==='nv_quiz')quizStart();else if(k==='nv_fish')fishOpen();else if(k==='nv_esc')escOpen();
  else if(k==='nv_bia'&&n&&n.nv==='bia')biaStart(n);else if(k==='nv_chest'&&n&&n.nv==='chest')chestOpen(n)}
const _open=UI.open;UI.open=function(k){if(typeof k==='string'&&k.slice(0,3)==='nv_'){act(k);return}if(NV.ov)return;return _open.apply(this,arguments)};
const _die=die;die=function(){if(NV.Esc){try{escEnd(false,'Tiêu sư trọng thương, xe hàng bị cướp mất!')}catch(e){console.error(e)}}return _die.apply(this,arguments)};
const _tr=travel;travel=function(){if(NV.Esc)escEnd(false,'',true);NV.guide=null;if(NV.ov)ovClose();return _tr.apply(this,arguments)};
const _st=showTitle;showTitle=function(){NV.Esc=null;NV.guide=null;if(NV.ov)ovClose();return _st.apply(this,arguments)};
const FKEYS=['Space','Enter','KeyJ','KeyF'];
window.addEventListener('keydown',e=>{if(!NV.ov)return;const c=e.code;e.stopImmediatePropagation();
  if(c==='Escape'){e.preventDefault();ovClose();return}
  if(NV.ov==='fish'){if(FKEYS.includes(c)){e.preventDefault();const rs=document.getElementById('nvRes');if(rs&&!rs.hidden){if(!e.repeat&&(c==='Enter'||c==='Space')){const b=rs.querySelector('.btn');b&&b.click()}return}if(!e.repeat)fishPress(true)}return}
  if(NV.ov==='quiz'){const Q=NV.Q;const m={Digit1:0,Digit2:1,Digit3:2,Digit4:3,KeyA:0,KeyB:1,KeyC:2,KeyD:3,Numpad1:0,Numpad2:1,Numpad3:2,Numpad4:3};
    if(Q&&!Q.done&&m[c]!=null){e.preventDefault();answer(m[c]);return}
    if(Q&&Q.done&&(c==='Enter'||c==='Space')){e.preventDefault();const b=document.querySelector('#nvNav .btn:last-child');b&&b.click()}return}
  if(c==='Enter'||c==='Space'){e.preventDefault();const b=document.querySelector('#nvBox .nvRow .btn:last-child');b&&b.click()}},true);
window.addEventListener('keyup',e=>{if(NV.ov==='fish'&&FKEYS.includes(e.code)){e.stopImmediatePropagation();fishPress(false)}},true);
window.addEventListener('resize',()=>{if(NV.ov==='fish'){NV.cv=null;sizeCv()}});

/* ================= XUẤT ================= */
window.NV={
  state:()=>S_(),QZ,BIA,FISH,ERA,MAPERA,CASTS,QUIZ_N,ESC_N,
  get ov(){return NV.ov},get Q(){return NV.Q},get F(){return NV.F},get Esc(){return NV.Esc},get guide(){return NV.guide},
  open:act,close:ovClose,quiz:{start:quizStart,answer,next},bia:biaStart,
  fish:{open:fishOpen,press:fishPress,reset:fishReset,tick:fishTick},
  esc:{open:escOpen,start:escStart,end:escEnd},chest:chestOpen,goTo:guide,sell,turnIn,
  hub:()=>HUB.show('kyngo'),
  dev:{tick(dt){tickOv(dt)},set manual(v){NV.manual=!!v},get manual(){return NV.manual},shift(ms){NV.off+=ms},setOffset(ms){NV.off=ms},
    set forceFish(id){NV.forceFish=id},set biteW(v){NV.biteW=v},set keyRate(v){NV.keyRate=v},today},
};
})();
