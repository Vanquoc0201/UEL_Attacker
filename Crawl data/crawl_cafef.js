import * as cheerio from 'cheerio';
import fs from 'fs/promises';
const TARGET_URLS = [
    'https://cafef.vn/sau-sau-rieng-them-mot-mat-hang-sieu-thuc-pham-tu-viet-nam-thanh-doi-thu-lon-cua-thai-lan-thu-hon-91-trieu-usd-chi-trong-1-thang-my-chau-au-deu-cuc-ky-ua-chuong-188250628005359829.chn',
    'https://cafef.vn/83-tan-vang-gia-trong-ngan-hang-cong-ty-vang-da-su-dung-chieu-tro-nhu-the-nao-de-qua-mat-ca-he-thong-1882506280750575.chn',
    'https://cafef.vn/khong-phai-thai-lan-hay-viet-nam-trai-cay-vua-cua-mot-quoc-gia-dang-len-nhu-dieu-gap-gio-sap-xuat-khau-hang-tuoi-sang-trung-quoc-chau-au-cung-dang-manh-tay-san-lung-188250628005551726.chn',
    'https://cafef.vn/dot-kich-2-xuong-dong-goi-cong-an-triet-pha-duong-day-san-xuat-sua-bot-ensure-gold-gia-quy-mo-hang-ty-dong-tich-thu-hon-5000-san-pham-188250627125823245.chn',
    'https://cafef.vn/sang-mung-1-am-lich-nguoi-dan-bac-giang-bang-hoang-vi-gia-vai-bong-dung-giam-manh-chi-con-3000-dong-kg-188250625152311925.chn',
    'https://cafef.vn/loai-hoa-nghin-ty-cua-viet-nam-duoc-an-do-co-bao-nhieu-mua-bay-nhieu-thu-gan-29-trieu-usd-ke-tu-dau-nam-nuoc-ta-cung-trung-quoc-thong-tri-nguon-cung-toan-cau-188250626103020633.chn',
    'https://cafef.vn/loai-hoa-nghin-ty-cua-viet-nam-duoc-an-do-co-bao-nhieu-mua-bay-nhieu-thu-gan-29-trieu-usd-ke-tu-dau-nam-nuoc-ta-cung-trung-quoc-thong-tri-nguon-cung-toan-cau-188250626103020633.chn',
    'https://cafef.vn/theo-doi-tai-khoan-ngan-hang-kha-nghi-cong-an-lap-tuc-pha-duong-day-buon-hang-gia-tu-trung-quoc-tich-thu-hon-34000-mon-do-nhai-188250625151842386.chn',
    'https://cafef.vn/khach-tay-xep-hang-loat-mon-an-viet-so-1-khong-phai-pho-nhan-xet-voi-toi-day-moi-la-mon-ngon-nhat-188250625100629936.chn',
    'https://cafef.vn/theo-doi-3-tuan-lien-tiep-canh-sat-dot-kich-8-nha-kho-phat-hien-duong-day-buon-ban-trai-phep-xuyen-bien-gioi-thu-giu-15000-san-pham-hang-nhai-188250626002717969.chn',
    'https://cafef.vn/ty-phu-pham-nhat-vuong-bat-ngo-choi-lon-tang-100-trieu-cho-khach-len-doi-xe-dien-chinh-sach-loi-chong-loi-chua-tung-co-tien-le-188250626103955424.chn',
    'https://cafef.vn/my-trung-quoc-dua-nhau-san-mua-mo-vang-cua-viet-nam-bo-tui-hon-17-ty-usd-nuoc-ta-dang-tro-thanh-ong-trum-thu-3-the-gioi-188250625140220719.chn',
    'https://cafef.vn/can-quet-suot-15-tieng-hai-ga-khong-lo-thuong-mai-dien-tu-lo-kho-hang-gia-cuc-khung-chua-hang-ngan-do-dien-tu-the-thao-18825062809510674.chn',
    'https://cafef.vn/xe-tay-ga-vua-ra-mat-cua-yamaha-xung-danh-vua-cong-nghe-nhung-co-thuc-su-dang-mua-hon-xe-honda-sym-188250628095629798.chn',
    'https://cafef.vn/90-ngay-hoan-thue-doi-ung-sap-ket-thuc-dn-viet-da-va-dang-ung-pho-toi-dau-18825062808551904.chn',
    'https://cafef.vn/chi-sau-gan-10-thang-thi-cong-vingroup-cua-ty-phu-pham-nhat-vuong-chinh-thuc-ban-giao-nha-trien-lam-lon-nhat-viet-nam-18825062715315899.chn',
    'https://cafef.vn/ctck-du-bao-loi-nhuan-loat-ngan-hang-lon-188250626234831135.chn',
    'https://cafef.vn/chung-khoan-techcombank-cong-bo-ke-hoach-ipo-231-trieu-co-phieu-188250626065117064.chn',
    'https://cafef.vn/mot-co-phieu-am-tham-vuot-dinh-14-lan-tu-dau-nam-thi-gia-len-gan-170000-dong-188250626225622134.chn',
    'https://cafef.vn/phien-25-6-khoi-ngoai-tiep-da-mua-rong-hon-tram-ty-nguoc-chieu-xa-manh-loat-co-phieu-ngan-hang-188250625153753872.chn',
    'https://cafef.vn/phien-27-6-khoi-ngoai-ban-rong-hon-150-ty-dong-tai-mot-ma-bluechips-188250627153619793.chn',
    'https://cafef.vn/trang-bi-1000-chip-ai-tien-tien-nhat-cua-nvidia-cong-ty-cong-nghe-cua-viet-nam-huong-den-muc-tieu-doanh-thu-ty-usd-18825062622384667.chn',
    'https://cafef.vn/mot-cong-ty-bat-dong-san-goi-von-5000-ty-dong-thanh-cong-tu-kenh-trai-phieu-chi-trong-2-ngay-188250628085441972.chn',
    'https://cafef.vn/chung-khoan-kafi-len-ke-hoach-chao-ban-250-trieu-co-phan-cho-co-dong-188250628085247669.chn',
    'https://cafef.vn/becamex-idc-len-ke-hoach-phat-hanh-2500-ty-dong-trai-phieu-188250627174323621.chn',
    'https://cafef.vn/chu-tich-phat-dat-pdr-he-lo-2-tin-vui-tri-gia-hang-chuc-ha-dat-vang-tai-tphcm-va-binh-duong-188250627222201403.chn',
    'https://cafef.vn/nop-them-thue-nhung-lai-nhieu-hon-chuyen-gia-chi-ra-giai-phap-giup-sme-va-ho-kinh-doanh-thich-ung-voi-quy-dinh-moi-188250626202126218.chn',
    'https://cafef.vn/5-ngan-hang-du-kien-lai-tren-30000-ty-dong-trong-nam-2025-188250623132406787.chn',
    'https://cafef.vn/trien-vong-cac-ngan-hang-giu-vung-on-dinh-trong-quy-ii-2025-188250619092236572.chn',
    'https://cafef.vn/dieu-gi-khien-gia-usd-tai-viet-nam-tang-cao-188250625100354005.chn',
    
];
const OUTPUT_FILE = 'cafef_data.json';
const CONCURRENT_LIMIT = 5;
const crawlArticleDetail = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Request thất bại với status: ${response.status}`);
        const html = await response.text();
        const $ = cheerio.load(html);
        const title = $('h1.title').text().trim();
        if (!title) return null;
        const sapo = $('h2.sapo').text().trim();
        const author = $('.author').text().trim();
        const publishedDate = $('.meta-info').attr('title');
        $('#mainContent script, #mainContent style, #mainContent .VCSortableInPreviewMode, #mainContent .link-content-footer').remove();
        const content = $('#mainContent').text().trim().replace(/\s+/g, ' ');
        return { source: 'CafeF', url, title, sapo, author, publishedDate, content };
    } catch (error) {
        console.error(`Lỗi khi crawl bài ${url}: ${error.message}`);
        return null;
    }
};
const saveData = async (dataToSave) => {
    try {
        await fs.writeFile(OUTPUT_FILE, JSON.stringify(dataToSave, null, 2));
        console.log(`\n--- HOÀN TẤT GHI FILE ---`);
        console.log(`Tổng số bài viết trong file ${OUTPUT_FILE} hiện là: ${dataToSave.length}`);
    } catch (error) {
        console.error("Lỗi nghiêm trọng khi ghi file JSON:", error);
    }
}
const main = async () => {
    console.log(`--- BẮT ĐẦU CRAWLER ---`);
    
    // Bước 1: Đọc dữ liệu cũ để kiểm tra trùng lặp
    let existingData = [];
    let existingUrls = new Set();
    try {
        const fileContent = await fs.readFile(OUTPUT_FILE, 'utf-8');
        existingData = JSON.parse(fileContent);
        existingUrls = new Set(existingData.map(item => item.url));
        console.log(`Đã tìm thấy ${existingData.length} bài viết trong file dữ liệu cũ.`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log("File dữ liệu chưa tồn tại. Sẽ tạo file mới.");
        } else {
            console.warn("Cảnh báo: Không thể đọc file dữ liệu cũ. Lỗi:", error.message);
        }
    }
    
    // Bước 2: Crawl song song tất cả các URL được cung cấp
    console.log(`\nBắt đầu crawl ${TARGET_URLS.length} URL...`);
    const allCrawledData = [];
    for (let i = 0; i < TARGET_URLS.length; i += CONCURRENT_LIMIT) {
        const batchUrls = TARGET_URLS.slice(i, i + CONCURRENT_LIMIT);
        const promises = batchUrls.map(url => crawlArticleDetail(url));
        const results = await Promise.all(promises);
        results.forEach(data => data && allCrawledData.push(data));
    }
    console.log(`Crawl hoàn tất. Thu thập được ${allCrawledData.length} bài viết hợp lệ.`);

    // Bước 3: Phân loại dữ liệu mới và dữ liệu trùng lặp
    console.log("\n--- KIỂM TRA DỮ LIỆU TRÙNG LẶP ---");
    const articlesToAdd = [];
    const skippedArticles = [];

    for (const article of allCrawledData) {
        if (existingUrls.has(article.url)) {
            skippedArticles.push(article);
        } else {
            articlesToAdd.push(article);
        }
    }

    // Bước 4: Thông báo kết quả cho người dùng
    if (skippedArticles.length > 0) {
        console.log(`\x1b[33m%s\x1b[0m`, `Đã bỏ qua ${skippedArticles.length} bài viết do đã tồn tại:`); 
        for (const article of skippedArticles) {
            console.log(`  - (Trùng lặp) ${article.title}`);
        }
    }

    if (articlesToAdd.length > 0) {
        console.log(`\x1b[32m%s\x1b[0m`, `Sẽ thêm ${articlesToAdd.length} bài viết mới vào file:`);
        for (const article of articlesToAdd) {
            console.log(`  - (Bài mới) ${article.title}`);
        }
    } else {
        console.log("Không có bài viết mới nào để thêm.");
    }
    
    // Bước 5: Ghi dữ liệu vào file
    if (articlesToAdd.length > 0) {
        const combinedData = [...existingData, ...articlesToAdd];
        await saveData(combinedData);
    }
    
    console.log("\n--- CHƯƠNG TRÌNH KẾT THÚC ---");
};
main();