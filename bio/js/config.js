/* ====== SỬA Ở ĐÂY ====== */
window.CFG = {
  /* Discord */
  id: "1507027608238297099",
  displayName: "24hMissEm",
  avatar: "11a8d3277bcce965ebd24203942e1631",
  banner: "a6207c102d0df3d935fca8c713d9c105",
  decoration: "a_5889f65c4a28cdafc06847cc02790af1",
  clan: { tag: "𝓤𝓓", guild: "1373374045138980980", badge: "b6f6582eb0301ce069e00b2a99323975" },
  lanyard: true,            // chấm trạng thái: cần vào server Discord của Lanyard (discord.gg/lanyard)

  /* Nội dung */
  pronouns: "He/him • Nero",
  bio: "Lua/Luau developer",
  bgImage: "",              // ảnh nền tĩnh (tuỳ chọn, dùng khi không có video)
  bgVideo: [                // video nền (tự làm mờ). Thử lần lượt từ trên xuống; để [] = tắt
    "https://github.com/9-0-9-9/Website_portfolio/raw/refs/heads/main/Creepy%20trees%20and%20dark%20sky%20-%20Atmospheric%20Landscapes%20-%20Free%20Horror%20Stock%20Footage%20-%20Free%20Stock%20Footage%20Archive%20(1080p).mp4",
    "assets/bg.mp4"         // dự phòng nếu link trên lỗi
  ],

  /* hiệu ứng nền */
  fx: {
    dots: 28,               // số chấm mờ nhấp nháy
    feathers: true,         // lông vũ rơi
    popups: true,           // chữ ngẫu nhiên hiện rồi mờ
    popupWords: ["huh?", "fuck"],
    cursor: true,           // con trỏ tuỳ chỉnh + vệt lông vũ (chỉ trên máy có chuột)
    featherImg: "https://raw.githubusercontent.com/9-0-9-9/Website_portfolio/refs/heads/main/feather.png",
    cursorImg:  "https://raw.githubusercontent.com/9-0-9-9/Website_portfolio/refs/heads/main/cursor.png"
  },

  /* chữ mờ to trên/dưới card, đổi phiên nhau */
  phrases: ["i <3 Luau", "Script Roblox developer", "im cool", "Lua & Python", "24hMissEm"],
  phraseInterval: 4000,     // ms

  links: [
    { label: "Owner at", url: "https://t0ruii.vercel.app" }
  ],
  socials: [                // github | discord
    { type: "github",  url: "https://github.com/ten-cua-ban" },
    { type: "discord", url: "https://discord.com/users/1507027608238297099" }
  ],
  languages: [
    { name: "Luau",   icon: "assets/icons/luau.png" },
    { name: "Lua",    icon: "assets/icons/lua.png" },
    { name: "Python", icon: "assets/icons/python.svg" }
  ],

  /* Nhạc: ảnh nào đi với bài nào thì sửa ở đây */
  volume: 0.6,
  tracks: [
    { title: "When You Find Me (Bonus Track)", artist: "", src: "assets/music/when-you-find-me-bonus-track.mp3", cover: "assets/covers/cover-1.jpg" }
  ]
};
