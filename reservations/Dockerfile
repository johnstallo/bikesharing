FROM microsoft/dotnet:sdk
WORKDIR /app
COPY reservations.csproj .
RUN dotnet restore reservations.csproj
COPY . .
RUN dotnet publish -o out reservations.csproj
ENV ASPNETCORE_URLS http://*:80
EXPOSE 80
ENTRYPOINT ["dotnet", "out/reservations.dll"]
# HEALTHCHECK CMD curl --fail http://localhost:80/ || exit 1