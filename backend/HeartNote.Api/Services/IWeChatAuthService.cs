using HeartNote.Api.Dtos;

namespace HeartNote.Api.Services;

public interface IWeChatAuthService
{
    Task<LoginResponse> LoginAsync(string code);
}
