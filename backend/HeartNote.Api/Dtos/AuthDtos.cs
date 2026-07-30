namespace HeartNote.Api.Dtos;

public class LoginRequest
{
    public string Code { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public UserInfo User { get; set; } = null!;
}

public class UserInfo
{
    public int Id { get; set; }
    public string? Nickname { get; set; }
    public string? AvatarUrl { get; set; }
}

public class WeChatSessionResult
{
    public string? OpenId { get; set; }
    public string? SessionKey { get; set; }
    public string? ErrCode { get; set; }
    public string? ErrMsg { get; set; }
}
