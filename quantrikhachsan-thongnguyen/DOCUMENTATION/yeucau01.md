# TÀI LIỆU CHỐT PHẠM VI DỰ ÁN

# Website Quản lý Khách sạn

Phạm vi chức năng đã thống nhất

Đã thống nhất 3 quyết định quan trọng của nhóm:

1. Admin: Có toàn quyền trên tất cả module và chức năng.
2. Thanh toán: Khách hàng thanh toán trực tuyến; Lễ tân ghi nhận thanh toán tiền mặt hoặc chuyển khoản.
3. Quản lý phòng: Có quản lý dọn phòng và bảo trì, không chỉ quản lý trạng thái phòng.

Dựa trên đó, mình chốt phạm vi dự án theo hướng một hệ thống quản lý khách sạn thực tế, có 4 nhóm người dùng, nhiều module và phù hợp với đồ án tốt nghiệp của nhóm 3–5 thành viên.

## I. Danh sách 17 module chính thức

Mình chia thành 4 nhóm nghiệp vụ để dễ quản lý và phân chia công việc.

### Nhóm 1. Quản trị hệ thống

| STT | Module                         | Chức năng                                                |
| --- | ------------------------------ | -------------------------------------------------------- |
| 01  | Authentication & Authorization | Đăng nhập, đăng xuất, đăng ký, đổi mật khẩu, phân quyền  |
| 02  | User & Employee Management     | Quản lý tài khoản, hồ sơ nhân viên, trạng thái tài khoản |
| 03  | System Configuration           | Cấu hình khách sạn, thuế, phụ phí, giờ nhận/trả phòng    |
| 04  | Activity Log                   | Ghi nhận lịch sử thao tác, người thực hiện, thời gian    |

### Nhóm 2. Quản lý nghiệp vụ khách sạn

| STT | Module                  | Chức năng                                                     |
| --- | ----------------------- | ------------------------------------------------------------- |
| 05  | Room Management         | Quản lý phòng, loại phòng, giá phòng, trạng thái phòng        |
| 06  | Customer Management     | Quản lý hồ sơ, thông tin và lịch sử khách hàng                |
| 07  | Booking Management      | Tìm phòng, đặt phòng, xác nhận, sửa và hủy đặt phòng          |
| 08  | Check-in / Check-out    | Nhận phòng, trả phòng, xác nhận khách lưu trú                 |
| 09  | Service Management      | Quản lý dịch vụ, giá dịch vụ, ghi nhận dịch vụ khách sử dụng  |
| 10  | Invoice & Payment       | Lập hóa đơn, tính tiền, thanh toán, hoàn tiền                 |
| 11  | Housekeeping Management | Quản lý dọn phòng, phân công nhân viên, xác nhận phòng sạch   |
| 12  | Maintenance Management  | Quản lý thiết bị, báo hỏng, yêu cầu sửa chữa, lịch sử bảo trì |

### Nhóm 3. Quản lý nhân sự và kinh doanh

| STT | Module                   | Chức năng                                              |
| --- | ------------------------ | ------------------------------------------------------ |
| 13  | Leave & Shift Management | Quản lý ca làm, gửi đơn nghỉ phép, duyệt nghỉ phép     |
| 14  | Reports & Statistics     | Báo cáo doanh thu, công suất phòng, đặt phòng, dịch vụ |
| 15  | Promotion Management     | Quản lý mã giảm giá, chương trình khuyến mãi           |

### Nhóm 4. Chức năng dành cho khách hàng

| STT | Module                  | Chức năng                                            |
| --- | ----------------------- | ---------------------------------------------------- |
| 16  | Notification Management | Thông báo đặt phòng, thanh toán, xác nhận, hủy phòng |
| 17  | Review & Feedback       | Đánh giá phòng, khách sạn, chất lượng dịch vụ        |

17 module được chốt

Lưu ý: 17 module là các nhóm chức năng nghiệp vụ, không nhất thiết tương ứng với 17 màn hình hoặc 17 bảng database. Mỗi module có thể bao gồm nhiều màn hình, API và bảng dữ liệu.

## II. Ma trận phân quyền chính thức

Hệ thống có 4 vai trò:

- ADMIN: Quản trị viên hệ thống.
- MANAGER: Quản lý khách sạn.
- RECEPTIONIST: Nhân viên lễ tân.
- CUSTOMER: Khách hàng.

### 1. Quy ước quyền

| Ký hiệu | Ý nghĩa                                     |
| ------- | ------------------------------------------- |
| ALL     | Toàn quyền: xem, thêm, sửa, xóa, duyệt      |
| CRUD    | Xem, thêm, sửa, xóa trong phạm vi được phép |
| R       | Chỉ xem                                     |
| C/R/U   | Thêm, xem, sửa                              |
| OWN     | Chỉ thao tác dữ liệu của chính mình         |
| APPROVE | Có quyền phê duyệt                          |
| –       | Không có quyền                              |

### 2. Ma trận phân quyền theo module

| STT | Module                         | Admin | Quản lý | Lễ tân  | Khách |
| --- | ------------------------------ | ----- | ------- | ------- | ----- |
| 01  | Authentication & Authorization | ALL   | R       | R       | OWN   |
| 02  | User & Employee                | ALL   | CRUD\*  | R\*     | OWN   |
| 03  | System Configuration           | ALL   | R       | –       | –     |
| 04  | Activity Log                   | ALL   | R       | –       | –     |
| 05  | Room Management                | ALL   | CRUD    | R/U\*   | R     |
| 06  | Customer Management            | ALL   | CRUD    | CRUD    | OWN   |
| 07  | Booking Management             | ALL   | CRUD    | CRUD    | OWN   |
| 08  | Check-in / Check-out           | ALL   | CRUD    | CRUD    | R\*   |
| 09  | Service Management             | ALL   | CRUD    | R/U\*   | R     |
| 10  | Invoice & Payment              | ALL   | CRUD    | C/R/U\* | OWN   |
| 11  | Housekeeping                   | ALL   | CRUD    | R/U\*   | –     |
| 12  | Maintenance                    | ALL   | CRUD    | C/R     | –     |
| 13  | Leave & Shift                  | ALL   | CRUD    | OWN     | –     |
| 14  | Reports & Statistics           | ALL   | R       | R\*     | –     |
| 15  | Promotion Management           | ALL   | CRUD    | R       | R     |
| 16  | Notification Management        | ALL   | CRUD    | C/R     | OWN   |
| 17  | Review & Feedback              | ALL   | CRUD    | R       | OWN   |

`*` Các quyền có giới hạn nghiệp vụ, giải thích chi tiết bên dưới.

### 3. Quyền chi tiết theo từng vai trò

A. ADMIN – Quản trị viên

Toàn quyền

Admin được phép:

- Quản lý toàn bộ tài khoản và vai trò.
- Thêm, sửa, xóa, khóa tài khoản.
- Quản lý toàn bộ phòng, khách hàng, đặt phòng.
- Quản lý nhân viên, ca làm và nghỉ phép.
- Quản lý dịch vụ, hóa đơn và thanh toán.
- Theo dõi dọn phòng, bảo trì.
- Xem báo cáo doanh thu và thống kê.
- Cấu hình hệ thống.
- Xem, chỉnh sửa và quản lý nhật ký hoạt động.
- Quản lý đánh giá và khuyến mãi.

B. MANAGER – Quản lý khách sạn

Quản lý được phép:

- Quản lý phòng, loại phòng và giá phòng.
- Quản lý hồ sơ nhân viên, không được phân quyền Admin.
- Quản lý thông tin khách hàng.
- Theo dõi và xử lý đặt phòng.
- Theo dõi hoạt động check-in/check-out.
- Quản lý dịch vụ và giá dịch vụ.
- Kiểm tra hóa đơn và doanh thu.
- Phân công dọn phòng.
- Quản lý yêu cầu bảo trì.
- Duyệt đơn xin nghỉ phép.
- Phân ca làm việc.
- Xem báo cáo doanh thu, công suất phòng.
- Quản lý khuyến mãi.
- Theo dõi đánh giá của khách hàng.

Quản lý không được tự ý thay đổi quyền hệ thống hoặc cấu hình bảo mật của Admin.

C. RECEPTIONIST – Lễ tân

Lễ tân được phép:

- Tra cứu phòng còn trống.
- Xem thông tin loại phòng và giá phòng.
- Đặt phòng hộ khách hàng.
- Xác nhận đặt phòng theo quy trình.
- Chỉnh sửa thông tin đặt phòng theo quyền được cấp.
- Check-in và check-out.
- Quản lý thông tin khách hàng.
- Ghi nhận dịch vụ khách sử dụng.
- Lập hóa đơn.
- Ghi nhận thanh toán tiền mặt/chuyển khoản.
- Gửi yêu cầu dọn phòng.
- Theo dõi trạng thái dọn phòng.
- Tạo yêu cầu sửa chữa khi phát hiện phòng hỏng.
- Xem lịch làm việc.
- Gửi đơn xin nghỉ phép.
- Xem thông tin ca làm của mình.

Lễ tân không được:

- Tạo tài khoản Admin hoặc tự cấp quyền.
- Thay đổi giá phòng, giá dịch vụ.
- Xóa hóa đơn đã thanh toán.
- Tự duyệt đơn nghỉ phép.
- Xem hoặc chỉnh sửa toàn bộ báo cáo quản trị.

D. CUSTOMER – Khách hàng

Khách hàng được phép:

- Đăng ký, đăng nhập.
- Cập nhật thông tin cá nhân.
- Xem danh sách phòng và giá phòng.
- Tìm kiếm phòng theo ngày nhận/trả.
- Đặt phòng trực tuyến.
- Thanh toán trực tuyến.
- Xem lịch sử đặt phòng của mình.
- Theo dõi trạng thái đặt phòng.
- Hủy đặt phòng theo chính sách.
- Xem hóa đơn của mình.
- Xem dịch vụ khách sạn.
- Nhận thông báo.
- Đánh giá khách sạn sau khi sử dụng dịch vụ.

Khách hàng không được xem dữ liệu đặt phòng, hóa đơn hay thông tin cá nhân của người khác.

## III. Các quy tắc nghiệp vụ quan trọng

Đây là phần rất quan trọng khi nhóm triển khai Database và Backend. Mình đề xuất chốt các quy tắc sau.

### 1. Quy trình đặt phòng

\#chatgpt-mermaid-\_r_el\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_el\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_el\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_el\_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-\_r_el\_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_el\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_el\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_el\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_el\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_el\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_el\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_el\_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_el\_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_el\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_el\_ p{margin:0;}#chatgpt-mermaid-\_r_el\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_el\_ .cluster-label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_el\_ .cluster-label span{color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_el\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_el\_ .label text,#chatgpt-mermaid-\_r_el\_ span{fill:rgb(237, 237, 237);color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_el\_ .node rect,#chatgpt-mermaid-\_r_el\_ .node circle,#chatgpt-mermaid-\_r_el\_ .node ellipse,#chatgpt-mermaid-\_r_el\_ .node polygon,#chatgpt-mermaid-\_r_el\_ .node path{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-\_r_el\_ .rough-node .label text,#chatgpt-mermaid-\_r_el\_ .node .label text,#chatgpt-mermaid-\_r_el\_ .image-shape .label,#chatgpt-mermaid-\_r_el\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_el\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_el\_ .rough-node .label,#chatgpt-mermaid-\_r_el\_ .node .label,#chatgpt-mermaid-\_r_el\_ .image-shape .label,#chatgpt-mermaid-\_r_el\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_el\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_el\_ .root .anchor path{fill:rgb(175, 175, 175)!important;stroke-width:0;stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_el\_ .arrowheadPath{fill:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_el\_ .edgePath .path{stroke:rgb(175, 175, 175);stroke-width:1px;}#chatgpt-mermaid-\_r_el\_ .flowchart-link{stroke:rgb(175, 175, 175);fill:none;}#chatgpt-mermaid-\_r_el\_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-\_r_el\_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_el\_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_el\_ .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#chatgpt-mermaid-\_r_el\_ .cluster rect{fill:rgb(48, 48, 48);stroke:rgba(255, 255, 255, 0.15);stroke-width:1px;}#chatgpt-mermaid-\_r_el\_ .cluster text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_el\_ .cluster span{color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_el\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(48, 48, 48);border:1px solid rgba(255, 255, 255, 0.15);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_el\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_el\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_el\_ .icon-shape,#chatgpt-mermaid-\_r_el\_ .image-shape{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-\_r_el\_ .icon-shape p,#chatgpt-mermaid-\_r_el\_ .image-shape p{background-color:rgb(0, 0, 0);padding:2px;}#chatgpt-mermaid-\_r_el\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_el\_ .image-shape .label rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_el\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_el\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_el\_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-\_r_el\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_el\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_el\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_el\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_el\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_el\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_el\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_el\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_el\_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-\_r_el\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_el\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_el\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_el\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_el\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_el\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_el\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_el\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(153, 206, 255);}#chatgpt-mermaid-\_r_el\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(153, 206, 255);}#chatgpt-mermaid-\_r_el\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_el\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_el\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-width:1px;}#chatgpt-mermaid-\_r_el\_ .node rect,#chatgpt-mermaid-\_r_el\_ .node circle,#chatgpt-mermaid-\_r_el\_ .node ellipse,#chatgpt-mermaid-\_r_el\_ .node polygon,#chatgpt-mermaid-\_r_el\_ .node path{fill:rgb(0, 40, 77);stroke:rgba(255, 255, 255, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_el\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_el\_ .mermaid-decision .label-container{fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_el\_ .edgePaths .flowchart-link{stroke:rgb(175, 175, 175);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_el\_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_el\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Khách hàng truy cập websiteTìm kiếm phòngChọn ngày nhận và trả phòngKiểm tra phòng trốngCó phòng?Thông báo hết phòngNhập thông tin đặt phòngXác nhận đặt phòngThanh toán trực tuyếnThanh toán thành công?Chờ thanh toán hoặc thất bạiĐặt phòng đã xác nhậnGửi thông báo cho kháchKhôngCóKhôngCó

Quy định:

- Không cho phép hai khách đặt trùng một phòng trong cùng khoảng thời gian.
- Kiểm tra phòng trống dựa trên ngày nhận và ngày trả.
- Đặt phòng phải có trạng thái rõ ràng.
- Nếu thanh toán thất bại, không tự động xác nhận thanh toán thành công.

### 2. Quy trình thanh toán

\#chatgpt-mermaid-\_r_es\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_es\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_es\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_es\_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-\_r_es\_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_es\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_es\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_es\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_es\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_es\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_es\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_es\_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_es\_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_es\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_es\_ p{margin:0;}#chatgpt-mermaid-\_r_es\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_es\_ .cluster-label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_es\_ .cluster-label span{color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_es\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_es\_ .label text,#chatgpt-mermaid-\_r_es\_ span{fill:rgb(237, 237, 237);color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_es\_ .node rect,#chatgpt-mermaid-\_r_es\_ .node circle,#chatgpt-mermaid-\_r_es\_ .node ellipse,#chatgpt-mermaid-\_r_es\_ .node polygon,#chatgpt-mermaid-\_r_es\_ .node path{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-\_r_es\_ .rough-node .label text,#chatgpt-mermaid-\_r_es\_ .node .label text,#chatgpt-mermaid-\_r_es\_ .image-shape .label,#chatgpt-mermaid-\_r_es\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_es\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_es\_ .rough-node .label,#chatgpt-mermaid-\_r_es\_ .node .label,#chatgpt-mermaid-\_r_es\_ .image-shape .label,#chatgpt-mermaid-\_r_es\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_es\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_es\_ .root .anchor path{fill:rgb(175, 175, 175)!important;stroke-width:0;stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_es\_ .arrowheadPath{fill:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_es\_ .edgePath .path{stroke:rgb(175, 175, 175);stroke-width:1px;}#chatgpt-mermaid-\_r_es\_ .flowchart-link{stroke:rgb(175, 175, 175);fill:none;}#chatgpt-mermaid-\_r_es\_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-\_r_es\_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_es\_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_es\_ .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#chatgpt-mermaid-\_r_es\_ .cluster rect{fill:rgb(48, 48, 48);stroke:rgba(255, 255, 255, 0.15);stroke-width:1px;}#chatgpt-mermaid-\_r_es\_ .cluster text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_es\_ .cluster span{color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_es\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(48, 48, 48);border:1px solid rgba(255, 255, 255, 0.15);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_es\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_es\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_es\_ .icon-shape,#chatgpt-mermaid-\_r_es\_ .image-shape{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-\_r_es\_ .icon-shape p,#chatgpt-mermaid-\_r_es\_ .image-shape p{background-color:rgb(0, 0, 0);padding:2px;}#chatgpt-mermaid-\_r_es\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_es\_ .image-shape .label rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_es\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_es\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_es\_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-\_r_es\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_es\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_es\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_es\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_es\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_es\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_es\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_es\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_es\_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-\_r_es\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_es\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_es\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_es\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_es\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_es\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_es\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_es\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(153, 206, 255);}#chatgpt-mermaid-\_r_es\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(153, 206, 255);}#chatgpt-mermaid-\_r_es\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_es\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_es\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-width:1px;}#chatgpt-mermaid-\_r_es\_ .node rect,#chatgpt-mermaid-\_r_es\_ .node circle,#chatgpt-mermaid-\_r_es\_ .node ellipse,#chatgpt-mermaid-\_r_es\_ .node polygon,#chatgpt-mermaid-\_r_es\_ .node path{fill:rgb(0, 40, 77);stroke:rgba(255, 255, 255, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_es\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_es\_ .mermaid-decision .label-container{fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_es\_ .edgePaths .flowchart-link{stroke:rgb(175, 175, 175);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_es\_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_es\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Khách đặt phòng hoặc trảphòngTạo hóa đơnPhương thức thanh toánKhách thanh toán trực tuyếnLễ tân nhận tiềnLễ tân kiểm tra giao dịchXác nhận giao dịchCập nhật trạng thái thanh toánLưu lịch sử thanh toánPhát hành hóa đơnOnlineTiền mặtChuyển khoản

Các trạng thái thanh toán đề xuất:

- `UNPAID`: Chưa thanh toán.
- `PENDING`: Đang chờ thanh toán.
- `PAID`: Đã thanh toán.
- `PARTIALLY_PAID`: Đã thanh toán một phần.
- `FAILED`: Thanh toán thất bại.
- `REFUNDED`: Đã hoàn tiền.
- `PARTIALLY_REFUNDED`: Đã hoàn tiền một phần.

Lưu ý: Thanh toán trực tuyến cần tích hợp cổng thanh toán phù hợp hoặc sử dụng môi trường sandbox để thử nghiệm trong đồ án. Với chuyển khoản, lễ tân chỉ xác nhận khi đã kiểm tra được giao dịch thực tế.

### 3. Quy trình quản lý phòng

Một phòng cần có các trạng thái:

| Trạng thái     | Ý nghĩa                       |
| -------------- | ----------------------------- |
| AVAILABLE      | Phòng sạch, sẵn sàng cho thuê |
| RESERVED       | Phòng đã được đặt             |
| OCCUPIED       | Đang có khách                 |
| DIRTY          | Khách vừa trả, chưa dọn       |
| CLEANING       | Đang được dọn                 |
| MAINTENANCE    | Đang bảo trì                  |
| OUT_OF_SERVICE | Tạm ngừng sử dụng             |

Không nên gộp tất cả trạng thái trên thành một trường duy nhất nếu muốn quản lý nghiệp vụ chính xác. Có thể quản lý tình trạng vệ sinh, tình trạng kỹ thuật và tình trạng khai thác riêng biệt.

### 4. Quy trình dọn phòng và bảo trì

\#chatgpt-mermaid-\_r_f3\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_f3\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_f3\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_f3\_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-\_r_f3\_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_f3\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_f3\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_f3\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_f3\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_f3\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_f3\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_f3\_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_f3\_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_f3\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_f3\_ p{margin:0;}#chatgpt-mermaid-\_r_f3\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_f3\_ .cluster-label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_f3\_ .cluster-label span{color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_f3\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_f3\_ .label text,#chatgpt-mermaid-\_r_f3\_ span{fill:rgb(237, 237, 237);color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_f3\_ .node rect,#chatgpt-mermaid-\_r_f3\_ .node circle,#chatgpt-mermaid-\_r_f3\_ .node ellipse,#chatgpt-mermaid-\_r_f3\_ .node polygon,#chatgpt-mermaid-\_r_f3\_ .node path{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-\_r_f3\_ .rough-node .label text,#chatgpt-mermaid-\_r_f3\_ .node .label text,#chatgpt-mermaid-\_r_f3\_ .image-shape .label,#chatgpt-mermaid-\_r_f3\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_f3\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_f3\_ .rough-node .label,#chatgpt-mermaid-\_r_f3\_ .node .label,#chatgpt-mermaid-\_r_f3\_ .image-shape .label,#chatgpt-mermaid-\_r_f3\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_f3\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_f3\_ .root .anchor path{fill:rgb(175, 175, 175)!important;stroke-width:0;stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_f3\_ .arrowheadPath{fill:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_f3\_ .edgePath .path{stroke:rgb(175, 175, 175);stroke-width:1px;}#chatgpt-mermaid-\_r_f3\_ .flowchart-link{stroke:rgb(175, 175, 175);fill:none;}#chatgpt-mermaid-\_r_f3\_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-\_r_f3\_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_f3\_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_f3\_ .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#chatgpt-mermaid-\_r_f3\_ .cluster rect{fill:rgb(48, 48, 48);stroke:rgba(255, 255, 255, 0.15);stroke-width:1px;}#chatgpt-mermaid-\_r_f3\_ .cluster text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_f3\_ .cluster span{color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_f3\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(48, 48, 48);border:1px solid rgba(255, 255, 255, 0.15);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_f3\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_f3\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_f3\_ .icon-shape,#chatgpt-mermaid-\_r_f3\_ .image-shape{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-\_r_f3\_ .icon-shape p,#chatgpt-mermaid-\_r_f3\_ .image-shape p{background-color:rgb(0, 0, 0);padding:2px;}#chatgpt-mermaid-\_r_f3\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_f3\_ .image-shape .label rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_f3\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_f3\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_f3\_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-\_r_f3\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_f3\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_f3\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_f3\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_f3\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_f3\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_f3\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_f3\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_f3\_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-\_r_f3\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_f3\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_f3\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_f3\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_f3\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_f3\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_f3\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_f3\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(153, 206, 255);}#chatgpt-mermaid-\_r_f3\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(153, 206, 255);}#chatgpt-mermaid-\_r_f3\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_f3\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_f3\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-width:1px;}#chatgpt-mermaid-\_r_f3\_ .node rect,#chatgpt-mermaid-\_r_f3\_ .node circle,#chatgpt-mermaid-\_r_f3\_ .node ellipse,#chatgpt-mermaid-\_r_f3\_ .node polygon,#chatgpt-mermaid-\_r_f3\_ .node path{fill:rgb(0, 40, 77);stroke:rgba(255, 255, 255, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_f3\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_f3\_ .mermaid-decision .label-container{fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_f3\_ .edgePaths .flowchart-link{stroke:rgb(175, 175, 175);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_f3\_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_f3\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Khách trả phòngChuyển trạng thái DIRTYQuản lý phân công nhân viêndọn phòngNhân viên thực hiện dọnphòngXác nhận hoàn thànhQuản lý hoặc người được phânquyền kiểm traChuyển trạng thái AVAILABLEPhát hiện thiết bị hỏngTạo yêu cầu bảo trìQuản lý tiếp nhậnPhân công sửa chữaHoàn thành bảo trìKiểm tra và cập nhật tình trạngphòng

## IV. Những quy tắc phân quyền cần khóa trong hệ thống

Để tránh việc phân quyền trên giao diện khác với Backend, nhóm cần áp dụng các nguyên tắc sau:

| Nghiệp vụ         | Quy định                                                         |
| ----------------- | ---------------------------------------------------------------- |
| Quản lý tài khoản | Quản lý không được tạo hoặc cấp quyền Admin                      |
| Quản lý phòng     | Lễ tân chỉ được xem và cập nhật trạng thái nghiệp vụ được phép   |
| Giá phòng         | Chỉ Admin và Quản lý được thay đổi                               |
| Giá dịch vụ       | Chỉ Admin và Quản lý được thay đổi                               |
| Đặt phòng         | Khách chỉ thao tác đặt phòng của mình                            |
| Hóa đơn           | Lễ tân không được xóa hóa đơn đã thanh toán                      |
| Hoàn tiền         | Quản lý đề xuất hoặc phê duyệt theo hạn mức; Admin có toàn quyền |
| Nghỉ phép         | Lễ tân gửi đơn, Quản lý duyệt                                    |
| Báo cáo           | Quản lý xem báo cáo khách sạn; Admin xem toàn hệ thống           |
| Nhật ký           | Người dùng không được tự sửa hoặc xóa lịch sử thao tác           |

Đặc biệt, Admin có toàn quyền nhưng hệ thống vẫn phải ghi nhật ký những thao tác quan trọng để đảm bảo khả năng kiểm tra và truy vết.

## V. Phân chia công việc cho nhóm 3–5 thành viên

Mình đề xuất chia theo module nghiệp vụ thay vì mỗi người làm một phần giao diện riêng.

| Thành viên   | Phụ trách                                                           |
| ------------ | ------------------------------------------------------------------- |
| Thành viên 1 | Authentication, Authorization, User, Employee, System Configuration |
| Thành viên 2 | Room, Housekeeping, Maintenance                                     |
| Thành viên 3 | Customer, Booking, Check-in / Check-out                             |
| Thành viên 4 | Service, Invoice, Payment, Promotion                                |
| Thành viên 5 | Reports, Notification, Review, tích hợp và kiểm thử                 |

Nếu nhóm chỉ có 3 thành viên, có thể gộp:

- Thành viên 1: Quản trị hệ thống và nhân sự.
- Thành viên 2: Quản lý phòng và nghiệp vụ đặt phòng.
- Thành viên 3: Thanh toán, dịch vụ, báo cáo và tích hợp.

Mỗi thành viên vẫn cần phối hợp thiết kế Database và API chung để tránh xung đột dữ liệu.

## VI. Bộ tài liệu cần xây dựng theo phạm vi đã chốt

Đây là thứ tự mình khuyên nhóm thực hiện:

1. SRS – Software Requirements Specification

   Đặc tả 17 module, 4 Actor, chức năng, yêu cầu phi chức năng và quy tắc nghiệp vụ.

   Ưu tiên 1
2. Use Case Diagram

   Sơ đồ tổng quan và sơ đồ chi tiết cho Admin, Manager, Receptionist, Customer.
3. Database Design

   ERD, danh sách bảng, khóa chính, khóa ngoại, quan hệ và ràng buộc dữ liệu.
4. UI/UX Design

   Thiết kế Dashboard và giao diện riêng theo từng vai trò.
5. API Specification

   Endpoint, HTTP Method, Request, Response, Authentication và Authorization.
6. Implementation

   Xây dựng Backend, Frontend, Database và tích hợp thanh toán.
7. Testing

   Test Case, phân quyền, kiểm thử nghiệp vụ, bảo mật và hiệu năng.

## VII. Kết luận phạm vi dự án

# 17

Module chức năng

# 4

Nhóm người dùng

# 3–5

Thành viên

# Web

Nền tảng triển khai

# SRS

Tài liệu đặc tả chính

4 vai trò chính thức

Admin · Quản lý · Lễ tân · Khách hàng

Phạm vi thanh toán

Online · Tiền mặt · Chuyển khoản

Nghiệp vụ đặc biệt

Dọn phòng · Bảo trì · Nghỉ phép · Phân ca

Đề xuất bước tiếp theo: Xây dựng lại tài liệu SRS phiên bản 1.0 dựa trên chính xác 17 module và ma trận phân quyền trên. Đây sẽ là tài liệu gốc để nhóm dùng thống nhất khi thiết kế Use Case, Database, API và triển khai code. Không nên tự ý thêm hoặc bỏ module trong quá trình thực hiện nếu chưa cập nhật lại phạm vi dự án.