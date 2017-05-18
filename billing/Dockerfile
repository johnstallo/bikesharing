FROM microsoft/dotnet:sdk
WORKDIR /app
COPY billing.csproj .
RUN dotnet restore billing.csproj
COPY . .
RUN dotnet publish -o out billing.csproj
ENV ASPNETCORE_URLS http://*:80
EXPOSE 80
ENTRYPOINT ["dotnet", "out/billing.dll"]
HEALTHCHECK CMD curl --fail http://localhost:80/ || exit 1