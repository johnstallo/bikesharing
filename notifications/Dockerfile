FROM microsoft/dotnet:sdk
WORKDIR /app
COPY notifications.csproj .
RUN dotnet restore notifications.csproj
COPY . .
RUN dotnet publish -o out notifications.csproj
ENV ASPNETCORE_URLS http://*:80
EXPOSE 80
ENTRYPOINT ["dotnet", "out/notifications.dll"]
# HEALTHCHECK CMD curl --fail http://localhost:80/ || exit 1