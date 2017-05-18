FROM microsoft/dotnet:sdk
WORKDIR /app
COPY . .
RUN dotnet restore bikes.csproj
RUN dotnet publish -o out bikes.csproj
ENV ASPNETCORE_URLS http://*:80
EXPOSE 80
ENTRYPOINT ["dotnet", "out/bikes.dll"]
# HEALTHCHECK CMD curl --fail http://localhost:80/ || exit 1