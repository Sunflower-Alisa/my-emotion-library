using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HeartNote.Api.Data;
using HeartNote.Api.Dtos;
using HeartNote.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace HeartNote.Api.Services;

public class WeChatAuthService : IWeChatAuthService
{
    private readonly AppDbContext _db;
    private readonly HttpClient _http;
    private readonly IConfiguration _config;

    public WeChatAuthService(AppDbContext db, HttpClient http, IConfiguration config)
    {
        _db = db;
        _http = http;
        _config = config;
    }

    public async Task<LoginResponse> LoginAsync(string code)
    {
        var appId = _config["WeChat:AppId"] ?? "";
        var secret = _config["WeChat:Secret"] ?? "";

        string openId;
        if (string.IsNullOrEmpty(secret) || secret == "dev")
        {
            openId = $"dev_openid_{code}";
        }
        else
        {
            var url = $"https://api.weixin.qq.com/sns/jscode2session?" +
                      $"appid={appId}&secret={secret}&js_code={code}&grant_type=authorization_code";

            var session = await _http.GetFromJsonAsync<WeChatSessionResult>(url)
                ?? throw new Exception("Failed to call WeChat API");

            if (string.IsNullOrEmpty(session.OpenId))
                throw new Exception($"WeChat login failed: {session.ErrCode} - {session.ErrMsg}");

            openId = session.OpenId;
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.OpenId == openId);
        if (user == null)
        {
            user = new User { OpenId = openId };
            _db.Users.Add(user);
        }
        else
        {
            user.UpdatedAt = DateTime.UtcNow;
        }
        await _db.SaveChangesAsync();

        var token = GenerateJwt(user);

        return new LoginResponse
        {
            Token = token,
            User = new UserInfo { Id = user.Id, Nickname = user.Nickname, AvatarUrl = user.AvatarUrl }
        };
    }

    private string GenerateJwt(User user)
    {
        var jwtKey = _config["Jwt:Key"] ?? "heartnote_default_key_change_me_please";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.OpenId),
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "HeartNote",
            audience: _config["Jwt:Audience"] ?? "HeartNote",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
